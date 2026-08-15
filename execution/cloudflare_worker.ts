/**
 * Cloudflare Worker API Gateway for Rynell AI Studio & Vectorine
 * Handles Turnstile security validation, R2 image storage, Replicate 8K upscaling, and RunPod Vector Tracing.
 */

export interface Env {
  R2_BUCKET: R2Bucket;
  REPLICATE_API_TOKEN: string;
  RUNPOD_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  PUBLIC_R2_URL: string; // e.g. "https://storage.rynell.org"
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

    // Endpoint: Health Check
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'OK', service: 'Rynell AI Gateway' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Endpoint 1: Start Upscale / Vectorize Job
    if (url.pathname === '/api/process' && request.method === 'POST') {
      try {
        const body = (await request.json()) as {
          imageR2Key: string;
          modelType: 'photo' | 'illustration' | 'logo' | 'complex_art';
          turnstileToken: string;
        };

        const { imageR2Key, modelType, turnstileToken } = body;

        // 1. Security Check: Cloudflare Turnstile Verification
        if (!turnstileToken) {
          return new Response(
            JSON.stringify({ error: 'Turnstile security token is required.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const formData = new FormData();
        formData.append('secret', env.TURNSTILE_SECRET_KEY);
        formData.append('response', turnstileToken);
        formData.append('remoteip', request.headers.get('CF-Connecting-IP') || '');

        const turnstileVerify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          body: formData
        });

        const turnstileResult = (await turnstileVerify.json()) as { success: boolean; 'error-codes'?: string[] };
        if (!turnstileResult.success) {
          return new Response(
            JSON.stringify({ error: 'Security verification failed (Turnstile).', details: turnstileResult['error-codes'] }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // 2. Construct public/signed R2 source image URL
        const imageUrl = `${env.PUBLIC_R2_URL || 'https://storage.rynell.org'}/${imageR2Key}`;

        // 3. Vectorine Routing (RunPod Serverless GPU for Logo & Vector Tracing)
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

        // 4. Replicate Routing (Real-ESRGAN & High Fidelity 8K Upscaling)
        let replicateVersion = 'xinntao/realesrgan:1b976a4d3b315e050ffadeef6a3212ab563993ed'; // Standard Photo Real-ESRGAN
        let faceEnhance = true;
        let scaleFactor = 4;

        if (modelType === 'illustration') {
          replicateVersion = 'xinntao/realesrgan-anime:anime-x4plus-version-id';
          faceEnhance = false;
        } else if (modelType === 'complex_art') {
          replicateVersion = 'nightmareai/real-esrgan:42fe626e41cc2ea6c816242a321ca549d5ed0f0d6574c6f5d0263f350c3132e0';
          faceEnhance = true;
          scaleFactor = 4;
        }

        const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            version: replicateVersion.includes(':') ? replicateVersion.split(':')[1] : replicateVersion,
            input: {
              image: imageUrl,
              scale: scaleFactor,
              face_enhance: faceEnhance
            }
          })
        });

        if (!replicateResponse.ok) {
          const errData = await replicateResponse.json().catch(() => ({}));
          throw new Error(`Replicate API error: ${replicateResponse.status} ${JSON.stringify(errData)}`);
        }

        const jobData = (await replicateResponse.json()) as { id: string; status: string };

        return new Response(
          JSON.stringify({ jobId: jobData.id, provider: 'replicate', status: jobData.status }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (err: any) {
        return new Response(
          JSON.stringify({ error: err.message || 'Internal Server Error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Endpoint 2: Poll Job Status
    if (url.pathname.startsWith('/api/jobs/') && request.method === 'GET') {
      try {
        const jobId = url.pathname.replace('/api/jobs/', '');
        const provider = url.searchParams.get('provider') || 'replicate';

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

        // Replicate Polling
        const statusResp = await fetch(`https://api.replicate.com/v1/predictions/${jobId}`, {
          headers: { 'Authorization': `Token ${env.REPLICATE_API_TOKEN}` }
        });
        const statusData = (await statusResp.json()) as any;

        const outputUrl = Array.isArray(statusData.output) ? statusData.output[0] : statusData.output;

        return new Response(
          JSON.stringify({
            jobId,
            status: statusData.status, // 'starting', 'processing', 'succeeded', 'failed'
            outputUrl: outputUrl || null,
            error: statusData.error || null
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
