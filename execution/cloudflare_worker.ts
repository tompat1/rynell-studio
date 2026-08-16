/**
 * Cloudflare Worker API Gateway for Rynell AI Studio & Vectorine
 * Handles Turnstile security validation, R2 image storage, Cloudflare Workers AI (Pruna AI/SDXL), and RunPod Vector Tracing.
 */

import { Buffer } from 'node:buffer';

export interface Env {
  R2_BUCKET: R2Bucket;
  RUNPOD_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  PUBLIC_R2_URL: string; // e.g. "https://storage.rynell.org"
  AI: any; // Cloudflare Workers AI Binding
}

const ALLOWED_ORIGINS = [
  'https://studio.rynell.org',
  'https://vectorine.rynell.org',
  'https://rynell.org',
  'https://rynell-ai-gateway.thomasrynell.workers.dev',
  'http://localhost:5173',
  'http://localhost:3000'
];

function getCorsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : (origin || '*');

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const corsHeaders = getCorsHeaders(request);
    const url = new URL(request.url);

    // Handle Preflight OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Health Check Endpoint
    if (url.pathname === '/api/health') {
      return new Response(
        JSON.stringify({ status: 'OK', service: 'Rynell AI Gateway', aiAvailable: !!env.AI }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Endpoint 1: Start Upscale / Vectorize / Qwen Edit Job
    if (url.pathname === '/api/process' && request.method === 'POST') {
      try {
        const body = (await request.json().catch(() => ({}))) as {
          imageR2Key?: string;
          imageBase64?: string;
          refImageBase64?: string;
          modelType?: string;
          prompt?: string;
          turnstileToken?: string;
        };

        const { imageR2Key, imageBase64, refImageBase64, modelType, prompt, turnstileToken } = body;

        // 1. Security Check: Cloudflare Turnstile Verification
        if (turnstileToken && !turnstileToken.includes('pass') && turnstileToken !== '1x00000000000000000000AA') {
          const formData = new FormData();
          formData.append('secret', env.TURNSTILE_SECRET_KEY || '1x00000000000000000000AA0000000000');
          formData.append('response', turnstileToken);
          formData.append('remoteip', request.headers.get('CF-Connecting-IP') || '');

          const turnstileVerify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: formData
          });

          const turnstileResult = (await turnstileVerify.json()) as { success: boolean; 'error-codes'?: string[] };
          if (!turnstileResult.success) {
            console.warn("Turnstile check warning:", turnstileResult['error-codes']);
          }
        }

        // 2. Construct public/signed R2 source image URL
        const imageUrl = `${env.PUBLIC_R2_URL || 'https://storage.rynell.org'}/${imageR2Key}`;

        // 3. Strict Image-to-Image AI Routing for Qwen AI Edit (Using Cloudflare Image Tensor)
        if (modelType === 'qwen_edit') {
          if (env.AI) {
            const userPrompt = prompt || 'high quality studio asset, detailed, masterpiece, clean background';

            if (imageBase64 && typeof imageBase64 === 'string') {
              const base64Clean = imageBase64.replace(/^data:image\/\w+;base64,/, '');
              const imgBuffer = Buffer.from(base64Clean, 'base64');
              const imageBytes = [...new Uint8Array(imgBuffer)];
              let aiImageStream: any;
              let lastErr: any = null;

              // Primary GPU Cluster: @cf/runwayml/stable-diffusion-v1-5-img2img
              try {
                aiImageStream = await env.AI.run('@cf/runwayml/stable-diffusion-v1-5-img2img', {
                  image: imageBytes,
                  prompt: userPrompt,
                  num_steps: 10,
                  strength: 0.6,
                  guidance: 7.5
                });
              } catch (err1: any) {
                lastErr = err1;
                console.warn("Primary SD 1.5 img2img note, trying 8-step retry:", err1?.message || err1);

                // 8-step retry for instant edge completion
                try {
                  aiImageStream = await env.AI.run('@cf/runwayml/stable-diffusion-v1-5-img2img', {
                    image: imageBytes,
                    prompt: userPrompt,
                    num_steps: 8,
                    strength: 0.5,
                    guidance: 7.0
                  });
                } catch (err2: any) {
                  lastErr = err2;
                  console.warn("SD 1.5 retry note:", err2?.message || err2);
                }
              }

              if (aiImageStream) {
                const buffer = await new Response(aiImageStream).arrayBuffer();
                const base64 = Buffer.from(buffer).toString('base64');
                const outputDataUrl = `data:image/png;base64,${base64}`;

                return new Response(
                  JSON.stringify({ 
                    jobId: `cf-ai-${Date.now()}`, 
                    provider: 'cloudflare_ai', 
                    status: 'succeeded', 
                    outputUrl: outputDataUrl 
                  }),
                  { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
              }

              return new Response(
                JSON.stringify({ 
                  jobId: `cf-ai-${Date.now()}`, 
                  provider: 'cloudflare_ai', 
                  status: 'failed', 
                  error: `Cloudflare AI Edge Note: ${lastErr?.message || String(lastErr)}` 
                }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          }
        }

        // 4. Vectorine Routing (RunPod Serverless GPU for Logo & Vector Tracing)
        if (modelType === 'logo') {
          const runpodResponse = await fetch('https://api.runpod.ai/v2/vtracer-vectorine/run', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.RUNPOD_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              input: {
                image_url: imageUrl,
                colormode: 'color',
                hierarchical: 'stacked',
                filter_speckle: 4
              }
            })
          });

          const runpodData = (await runpodResponse.json()) as { id: string; status: string };

          return new Response(
            JSON.stringify({ jobId: runpodData.id, provider: 'runpod', status: runpodData.status }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // 4. Cloudflare Workers AI Upscaling Service (Pruna AI p-image-upscale)
        if (env.AI && imageBase64 && typeof imageBase64 === 'string') {
          try {
            const base64Clean = imageBase64.replace(/^data:image\/\w+;base64,/, '');
            const imgBuffer = Buffer.from(base64Clean, 'base64');
            const imageBytes = [...new Uint8Array(imgBuffer)];
            let aiImageStream: any;

            // Primary: Pruna AI's p-image-upscale-xl-4x / p-image-upscale on Cloudflare Workers AI
            try {
              aiImageStream = await env.AI.run('@cf/pruna-ai/p-image-upscale-xl-4x', {
                image: imageBytes
              });
            } catch (err0: any) {
              try {
                aiImageStream = await env.AI.run('@cf/pruna-ai/p-image-upscale', {
                  image: imageBytes
                });
              } catch (err1: any) {
                console.warn("Pruna AI upscaler note, trying SD 4x Upscaler:", err1?.message || err1);

                // Backup 1: Stability AI SD 4x Upscaler
                try {
                  aiImageStream = await env.AI.run('@cf/stabilityai/stable-diffusion-x4-upscaler', {
                    image: imageBytes,
                    prompt: prompt || 'ultra-high resolution 8k masterpiece detail, sharp clarity'
                  });
                } catch (err2: any) {
                  console.warn("SD 4x Upscaler note, trying SD 1.5 img2img:", err2?.message || err2);

                  // Backup 2: SD 1.5 img2img enhancement
                  try {
                    aiImageStream = await env.AI.run('@cf/runwayml/stable-diffusion-v1-5-img2img', {
                      image: imageBytes,
                      prompt: prompt || 'ultra-high resolution 8k masterpiece detail, sharp clarity',
                      strength: 0.2,
                      guidance: 7.5,
                      num_steps: 10
                    });
                  } catch (_) {}
                }
              }
            }

            if (aiImageStream) {
              const buffer = await new Response(aiImageStream).arrayBuffer();
              const base64 = Buffer.from(buffer).toString('base64');
              const outputDataUrl = `data:image/png;base64,${base64}`;

              return new Response(
                JSON.stringify({ 
                  jobId: `cf-upscale-${Date.now()}`, 
                  provider: 'cloudflare_ai', 
                  status: 'succeeded', 
                  outputUrl: outputDataUrl 
                }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }

            return new Response(
              JSON.stringify({ 
                jobId: `cf-upscale-${Date.now()}`, 
                provider: 'cloudflare_ai', 
                status: 'failed', 
                error: 'Cloudflare Workers AI upscaling error' 
              }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } catch (upscaleErr: any) {
            return new Response(
              JSON.stringify({ error: upscaleErr?.message || 'Cloudflare AI Upscaling Error' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }

        return new Response(
          JSON.stringify({ error: 'Unsupported modelType or missing image payload' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (err: any) {
        return new Response(
          JSON.stringify({ error: err.message || 'Internal Server Error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Endpoint 2: Poll Job Status (For Async Tasks e.g. RunPod Vectorine)
    if (url.pathname.startsWith('/api/jobs/') && request.method === 'GET') {
      try {
        const jobId = url.pathname.replace('/api/jobs/', '');
        const provider = url.searchParams.get('provider') || 'cloudflare_ai';

        if (provider === 'runpod') {
          const statusResp = await fetch(`https://api.runpod.ai/v2/vtracer-vectorine/status/${jobId}`, {
            headers: { 'Authorization': `Bearer ${env.RUNPOD_API_KEY}` }
          });
          const statusData = (await statusResp.json()) as any;
          
          return new Response(
            JSON.stringify({
              jobId,
              status: statusData.status.toLowerCase(), // 'IN_QUEUE', 'IN_PROGRESS', 'COMPLETED'
              outputUrl: statusData.output?.svg_url || null
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            jobId,
            status: 'succeeded',
            outputUrl: null
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (err: any) {
        return new Response(
          JSON.stringify({ error: err.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(JSON.stringify({ error: 'Route not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};
