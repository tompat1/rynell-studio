import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCms } from '../contexts/CmsContext';
import samplePortrait from '../assets/studio_portrait.jpg';

const OUTPUT_SIZE = 1080;
const MAX_PHOTOS = 6;

const ensureHashtag = (raw = '') => {
  const cleaned = String(raw ?? '')
    .replace(/^#+/, '')
    .toUpperCase();
  return `#${cleaned}`;
};

const FRAME_STYLES = [
  { id: 'arc', label: 'ARC', icon: '◐', desc: 'Tapered bottom arc with curved #badge copy' },
  { id: 'ring', label: 'RING', icon: '◯', desc: 'Full 360° perimeter ring with curved #badge copy' },
  { id: 'badge', label: 'BADGE', icon: '🏷', desc: 'Bottom pill tag badge with crisp horizontal #copy' },
  { id: 'gradient', label: 'GRADIENT', icon: '◌', desc: 'Multi-stop gradient perimeter ring (no text)' },
  { id: 'none', label: 'NONE', icon: '⊘', desc: 'Clean portrait with no frame or text overlay' }
];

const FRAME_PRESETS = [
  { id: 'open', label: '#OPEN TO WORK', text: '#OPEN TO WORK', color: '#18864B', secondaryColor: '#00E5FF', textColor: '#FFFFFF' },
  { id: 'hiring', label: '#HIRING', text: '#HIRING', color: '#7B45E7', secondaryColor: '#FF4D6D', textColor: '#FFFFFF' },
  { id: 'freelance', label: '#FREELANCE', text: '#FREELANCE', color: '#FF6A00', secondaryColor: '#FFB400', textColor: '#FFFFFF' },
  { id: 'connect', label: '#CONNECT', text: '#CONNECT', color: '#0A66C2', secondaryColor: '#00E5FF', textColor: '#FFFFFF' },
  { id: 'creator', label: '#CREATOR', text: '#CREATOR', color: '#22A559', secondaryColor: '#FFB400', textColor: '#FFFFFF' },
  { id: 'speaker', label: '#SPEAKER', text: '#SPEAKER', color: '#E11D48', secondaryColor: '#FF6A00', textColor: '#FFFFFF' },
  { id: 'mentor', label: '#MENTOR', text: '#MENTOR', color: '#D97706', secondaryColor: '#7B45E7', textColor: '#FFFFFF' }
];

const BG_COLOR_SWATCHES = [
  { id: 'transparent', label: 'TRANSPARENT', value: 'transparent' },
  { id: 'white', label: 'WHITE', value: '#FFFFFF' },
  { id: 'black', label: 'BLACK', value: '#0B0D13' },
  { id: 'orange', label: 'ORANGE', value: '#FF6A00' },
  { id: 'blue', label: 'BLUE', value: '#0A66C2' },
  { id: 'purple', label: 'PURPLE', value: '#7B45E7' },
  { id: 'green', label: 'GREEN', value: '#18864B' },
  { id: 'yellow', label: 'GOLD', value: '#FFB400' },
  { id: 'cyan', label: 'CYAN', value: '#00B8D9' },
  { id: 'rose', label: 'ROSE', value: '#E11D48' },
  { id: 'slate', label: 'SLATE', value: '#CBD5E1' }
];

const SOCIAL_PLATFORMS = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    shortName: 'IN',
    size: 800,
    shape: 'circle',
    safeScale: 1,
    accent: '#0A66C2',
    bio: 'Helping founders tell their story | Carousels, content and personal brand',
    meta: 'Stockholm, Sweden · 500+ connections',
    actionPrimary: 'Open to',
    actionSecondary: 'Add section'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    shortName: 'IG',
    size: 1080,
    shape: 'circle',
    safeScale: 0.96,
    storyRing: true,
    accent: '#E1306C',
    bio: 'Visual Systems & Brutalist Brand Direction ⚡ New drops weekly',
    meta: '14.8K followers · 312 posts',
    actionPrimary: 'Follow',
    actionSecondary: 'Message'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    shortName: 'TT',
    size: 800,
    shape: 'circle',
    safeScale: 0.97,
    accent: '#00F2FE',
    bio: 'Daily design breakdowns & creative workflows 🎬',
    meta: '84.2K Followers · 1.2M Likes',
    actionPrimary: 'Follow',
    actionSecondary: 'Share'
  },
  {
    id: 'slack',
    name: 'Slack',
    shortName: 'SL',
    size: 1024,
    shape: 'rounded-square',
    safeScale: 0.92,
    statusDot: '#2BAC76',
    accent: '#4A154B',
    bio: 'Staff Product & Brand Designer — Available for design reviews',
    meta: '🟢 Active · Local time 14:30 CET',
    actionPrimary: 'Message',
    actionSecondary: 'Huddle'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    shortName: 'FB',
    size: 1080,
    shape: 'circle',
    safeScale: 0.96,
    accent: '#1877F2',
    bio: 'Creative Director & Founder at Rynell Studio.',
    meta: '4.9K friends · Stockholm',
    actionPrimary: 'Add friend',
    actionSecondary: 'Message'
  },
  {
    id: 'x',
    name: 'X',
    shortName: 'X',
    size: 800,
    shape: 'circle',
    safeScale: 0.98,
    accent: '#1D9BF0',
    bio: 'Building visual tools, AI workflows & sharp brand systems.',
    meta: 'Joined March 2019 · 18.4K Followers',
    actionPrimary: 'Follow',
    actionSecondary: 'Notify'
  },
  {
    id: 'threads',
    name: 'Threads',
    shortName: 'TH',
    size: 1080,
    shape: 'circle',
    safeScale: 0.96,
    accent: '#101010',
    bio: 'Short thoughts on design systems, typography & creative direction.',
    meta: '9,420 followers · rynell.studio',
    actionPrimary: 'Follow',
    actionSecondary: 'Mention'
  },
  {
    id: 'discord',
    name: 'Discord',
    shortName: 'DC',
    size: 512,
    shape: 'circle',
    safeScale: 0.94,
    statusDot: '#23A55A',
    accent: '#5865F2',
    bio: 'DESIGN LAB LEAD // Sharing shaders, vectors & UI kits in #showcase',
    meta: 'Online · Playing Figma / Vite',
    actionPrimary: 'Send Message',
    actionSecondary: 'Add Friend'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    shortName: 'WA',
    size: 640,
    shape: 'circle',
    safeScale: 0.97,
    accent: '#25D366',
    bio: 'Hey there! I am using WhatsApp for studio client check-ins.',
    meta: '+46 70 123 45 67 · Business Account',
    actionPrimary: 'Message',
    actionSecondary: 'Voice Call'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    shortName: 'YT',
    size: 800,
    shape: 'circle',
    safeScale: 0.98,
    accent: '#FF0000',
    bio: 'Tutorials on brutalist web design, AI creative tooling & motion.',
    meta: '@yourname · 42.5K subscribers · 94 videos',
    actionPrimary: 'Subscribe',
    actionSecondary: 'Join'
  }
];

const createPhotoEntry = ({
  id,
  name,
  src,
  zoom = 1,
  offsetX = 0,
  offsetY = 0,
  rotation = 0,
  mirrorX = false,
  mirrorY = false,
  bgRemoved = false,
  bgColor = 'transparent',
  bgTolerance = 38
}) => ({
  id,
  name,
  originalSrc: src,
  cutoutSrc: null,
  zoom,
  offsetX,
  offsetY,
  rotation,
  mirrorX,
  mirrorY,
  bgRemoved,
  bgColor,
  bgTolerance
});

/**
 * Generates a high-contrast monochrome studio variant of the sample portrait
 * so the user immediately has 2 photos to compare out of the box (as in the reference UI),
 * while still allowing up to 6 custom photo uploads.
 */
const createMonochromeSampleVariant = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const w = img.naturalWidth || 640;
        const h = img.naturalHeight || 640;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          const contrasted = Math.max(0, Math.min(255, (lum - 128) * 1.28 + 136));
          d[i] = contrasted;
          d[i + 1] = contrasted;
          d[i + 2] = contrasted;
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      } catch {
        resolve(src);
      }
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });

/**
 * 100% In-Browser Portrait Background Removal Engine.
 * Combines perimeter background color clustering, edge-connected flood fill,
 * portrait spatial silhouette weighting, and soft alpha edge feathering.
 */
const removeImageBackgroundLocal = (imageSrc, tolerance = 38) =>
  new Promise((resolve) => {
    if (!imageSrc) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const origW = img.naturalWidth || img.width || 600;
        const origH = img.naturalHeight || img.height || 600;
        const maxSegDim = 560;
        const scale = Math.min(1, maxSegDim / Math.max(origW, origH));
        const w = Math.max(64, Math.round(origW * scale));
        const h = Math.max(64, Math.round(origH * scale));

        const segCanvas = document.createElement('canvas');
        segCanvas.width = w;
        segCanvas.height = h;
        const segCtx = segCanvas.getContext('2d', { willReadFrequently: true });
        segCtx.drawImage(img, 0, 0, w, h);

        const imgData = segCtx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // 1. Sample background pixels along top, left, right, and upper-bottom edges
        const samples = [];
        const step = Math.max(2, Math.floor(Math.min(w, h) / 36));
        const pushSample = (x, y) => {
          const idx = (y * w + x) * 4;
          if (data[idx + 3] < 32) return;
          samples.push([data[idx], data[idx + 1], data[idx + 2]]);
        };

        for (let x = 0; x < w; x += step) {
          pushSample(x, 0);
          pushSample(x, Math.min(h - 1, 2));
        }
        for (let y = 0; y < Math.floor(h * 0.82); y += step) {
          pushSample(0, y);
          pushSample(w - 1, y);
        }

        if (samples.length === 0) {
          resolve(imageSrc);
          return;
        }

        // Build representative background clusters via simple k-means-like bucketing
        const clusters = [];
        const clusterRadius = 28;
        for (const s of samples) {
          let found = false;
          for (const c of clusters) {
            const dr = s[0] - c.r;
            const dg = s[1] - c.g;
            const db = s[2] - c.b;
            const dist = Math.sqrt(dr * dr + dg * dg + db * db);
            if (dist < clusterRadius) {
              c.r = (c.r * c.count + s[0]) / (c.count + 1);
              c.g = (c.g * c.count + s[1]) / (c.count + 1);
              c.b = (c.b * c.count + s[2]) / (c.count + 1);
              c.count += 1;
              found = true;
              break;
            }
          }
          if (!found) {
            clusters.push({ r: s[0], g: s[1], b: s[2], count: 1 });
          }
        }
        clusters.sort((a, b) => b.count - a.count);
        const topClusters = clusters.slice(0, 5);

        const colorDistToBg = (r, g, b) => {
          let minD = Infinity;
          for (let i = 0; i < topClusters.length; i++) {
            const c = topClusters[i];
            const dr = r - c.r;
            const dg = g - c.g;
            const db = b - c.b;
            // Perceptual weighted Euclidean distance
            const d = Math.sqrt(0.3 * dr * dr + 0.59 * dg * dg + 0.11 * db * db);
            if (d < minD) minD = d;
          }
          return minD;
        };

        // 2. Flood-fill from outer border with portrait silhouette protection
        const visited = new Uint8Array(w * h);
        const bgMask = new Float32Array(w * h); // 1 = background, 0 = foreground
        const queue = new Int32Array(w * h);
        let qHead = 0;
        let qTail = 0;

        const enqueue = (x, y) => {
          if (x < 0 || x >= w || y < 0 || y >= h) return;
          const pos = y * w + x;
          if (visited[pos]) return;
          visited[pos] = 1;
          queue[qTail++] = pos;
        };

        // Seed top, left, right edges, and bottom corners (leaving center bottom for torso)
        for (let x = 0; x < w; x++) {
          enqueue(x, 0);
          if (x < w * 0.16 || x > w * 0.84) {
            enqueue(x, h - 1);
          }
        }
        for (let y = 0; y < h; y++) {
          enqueue(0, y);
          enqueue(w - 1, y);
        }

        const baseThreshold = Math.max(12, Math.min(85, tolerance));

        while (qHead < qTail) {
          const pos = queue[qHead++];
          const x = pos % w;
          const y = (pos - x) / w;
          const idx = pos * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Spatial prior: protect central head & shoulders ellipse
          const nx = (x / w - 0.5) / 0.34;
          const nyHead = (y / h - 0.42) / 0.32;
          const nyTorso = (y / h - 0.86) / 0.36;
          const inHeadCore = nx * nx + nyHead * nyHead < 0.55;
          const inTorsoCore = (x / w - 0.5) * (x / w - 0.5) / (0.42 * 0.42) + nyTorso * nyTorso < 0.58;

          const localMultiplier = (inHeadCore || inTorsoCore) ? 0.52 : 1.08;
          const distBg = colorDistToBg(r, g, b);

          if (distBg <= baseThreshold * localMultiplier) {
            bgMask[pos] = 1;
            enqueue(x + 1, y);
            enqueue(x - 1, y);
            enqueue(x, y + 1);
            enqueue(x, y - 1);
          }
        }

        // 3. Soften & feather the mask boundary (2-pass box blur on alpha)
        const alpha = new Float32Array(w * h);
        for (let i = 0; i < w * h; i++) {
          alpha[i] = 1 - bgMask[i];
        }

        const smoothed = new Float32Array(w * h);
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const p = y * w + x;
            const sum =
              alpha[p] * 4 +
              alpha[p - 1] * 2 +
              alpha[p + 1] * 2 +
              alpha[p - w] * 2 +
              alpha[p + w] * 2 +
              alpha[p - w - 1] +
              alpha[p - w + 1] +
              alpha[p + w - 1] +
              alpha[p + w + 1];
            smoothed[p] = sum / 16;
          }
        }

        for (let i = 0; i < w * h; i++) {
          const a = smoothed[i];
          data[i * 4 + 3] = Math.round(Math.max(0, Math.min(1, (a - 0.12) / 0.82)) * 255);
        }
        segCtx.putImageData(imgData, 0, 0);

        // Render full-resolution cutout using compositing
        const outCanvas = document.createElement('canvas');
        outCanvas.width = origW;
        outCanvas.height = origH;
        const outCtx = outCanvas.getContext('2d');
        outCtx.imageSmoothingEnabled = true;
        outCtx.imageSmoothingQuality = 'high';
        outCtx.drawImage(segCanvas, 0, 0, origW, origH);
        outCtx.globalCompositeOperation = 'source-in';
        outCtx.drawImage(img, 0, 0, origW, origH);

        resolve(outCanvas.toDataURL('image/png'));
      } catch {
        resolve(imageSrc);
      }
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });

const hexToRgba = (hex, alpha = 1) => {
  const clean = String(hex || '#18864B').replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean.padEnd(6, '0').slice(0, 6);
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const drawCurvedText = (context, text, options) => {
  const { centerX, centerY, radius, fontSize, color, centerAngle = Math.PI / 2 } = options;
  const formatted = ensureHashtag(text).trim();
  if (!formatted || formatted === '#') return;
  const characters = [...formatted];

  context.save();
  context.fillStyle = color;
  context.font = `800 ${fontSize}px Poppins, Arial, sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  const tracking = fontSize * 0.13;
  const characterWidths = characters.map((character) => context.measureText(character).width + tracking);
  const totalAngle = characterWidths.reduce((total, width) => total + width, 0) / radius;
  let angle = centerAngle + (totalAngle / 2);

  characters.forEach((character, index) => {
    const characterAngle = characterWidths[index] / radius;
    angle -= characterAngle / 2;
    context.save();
    context.translate(
      centerX + Math.cos(angle) * radius,
      centerY + Math.sin(angle) * radius
    );
    context.rotate(angle - (Math.PI / 2));
    context.fillText(character, 0, 0);
    context.restore();
    angle -= characterAngle / 2;
  });

  context.restore();
};

const drawRoundedRectPath = (ctx, x, y, width, height, radius) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
};

/**
 * Core deterministic frame & portrait renderer.
 * Supports all 5 frame styles (arc, ring, badge, gradient, none),
 * rotation, horizontal/vertical mirroring, background removal, background color,
 * outer border ring, and platform-specific safe scaling.
 */
const renderFrameToCanvas = (canvas, imageElement, config) => {
  const {
    size = OUTPUT_SIZE,
    frameStyle = 'arc',
    badgeText = '#OPEN TO WORK',
    arcColor = '#18864B',
    secondaryColor = '#00E5FF',
    textColor = '#FFFFFF',
    zoom = 1,
    offsetX = 0,
    offsetY = 0,
    rotation = 0,
    mirrorX = false,
    mirrorY = false,
    arcWidth = 136,
    fontSize = 56,
    bgColor = 'transparent',
    borderWidth = 0,
    borderColor = '#FFFFFF',
    includeGuide = false,
    guideShape = 'circle',
    safeScale = 1
  } = config;

  const ctx = canvas.getContext('2d');
  if (!ctx || !imageElement) return;

  canvas.width = size;
  canvas.height = size;
  ctx.clearRect(0, 0, size, size);

  const scaleRatio = size / OUTPUT_SIZE;
  const center = size / 2;

  // 1. Background fill
  if (bgColor && bgColor !== 'transparent') {
    ctx.save();
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
    ctx.restore();
  }

  // 2. Transformed Portrait (Zoom, Pan, Rotate, Mirror)
  const imgW = imageElement.naturalWidth || imageElement.width || size;
  const imgH = imageElement.naturalHeight || imageElement.height || size;
  const coverScale = Math.max(size / imgW, size / imgH) * zoom;
  const drawWidth = imgW * coverScale;
  const drawHeight = imgH * coverScale;
  const travelX = Math.max(0, (drawWidth - size) / 2) + size * 0.24;
  const travelY = Math.max(0, (drawHeight - size) / 2) + size * 0.24;
  const panX = (offsetX / 100) * travelX;
  const panY = (offsetY / 100) * travelY;

  ctx.save();
  ctx.translate(center + panX, center + panY);
  if (rotation) {
    ctx.rotate((rotation * Math.PI) / 180);
  }
  if (mirrorX || mirrorY) {
    ctx.scale(mirrorX ? -1 : 1, mirrorY ? -1 : 1);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(imageElement, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  ctx.restore();

  // 3. Frame Overlay (scaled by platform safeScale so Slack rounded squares or small avatars never clip)
  const effectiveScale = scaleRatio * safeScale;
  const scaledArcWidth = arcWidth * effectiveScale;
  const scaledFontSize = fontSize * effectiveScale;
  const formattedText = ensureHashtag(badgeText);
  const hasCopy = formattedText.length > 1;

  if (frameStyle === 'arc') {
    // Left-oriented bottom arc matching official creator frame + curved left-oriented #copy
    const arcRadius = 492 * effectiveScale - scaledArcWidth / 2;
    ctx.save();
    let grad;
    if (typeof ctx.createConicGradient === 'function') {
      grad = ctx.createConicGradient(0, center, center);
      grad.addColorStop(0.05, hexToRgba(arcColor, 0));
      grad.addColorStop(0.12, hexToRgba(arcColor, 0.45));
      grad.addColorStop(0.20, hexToRgba(arcColor, 0.92));
      grad.addColorStop(0.26, hexToRgba(arcColor, 1));
      grad.addColorStop(0.38, hexToRgba(arcColor, 1));
      grad.addColorStop(0.46, hexToRgba(arcColor, 0.75));
      grad.addColorStop(0.53, hexToRgba(arcColor, 0));
    } else {
      grad = ctx.createLinearGradient(
        center - arcRadius * 0.85,
        center - arcRadius * 0.2,
        center + arcRadius * 0.75,
        center + arcRadius * 0.55
      );
      grad.addColorStop(0, hexToRgba(arcColor, 0));
      grad.addColorStop(0.2, hexToRgba(arcColor, 0.85));
      grad.addColorStop(0.55, hexToRgba(arcColor, 1));
      grad.addColorStop(0.85, hexToRgba(arcColor, 0.7));
      grad.addColorStop(1, hexToRgba(arcColor, 0));
    }

    ctx.strokeStyle = grad;
    ctx.lineWidth = scaledArcWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(center, center, arcRadius, Math.PI * 0.12, Math.PI * 1.04, false);
    ctx.stroke();
    ctx.restore();

    if (hasCopy) {
      drawCurvedText(ctx, formattedText, {
        centerX: center,
        centerY: center,
        radius: arcRadius,
        fontSize: scaledFontSize,
        color: textColor,
        centerAngle: Math.PI * 0.63
      });
    }
  } else if (frameStyle === 'ring') {
    // Pure 360° uniform perimeter ring (no separate bottom arc) with curved #copy
    const ringStroke = scaledArcWidth;
    const ringRadius = 492 * effectiveScale - ringStroke / 2;

    ctx.save();
    ctx.strokeStyle = arcColor;
    ctx.lineWidth = ringStroke;
    ctx.beginPath();
    ctx.arc(center, center, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    if (hasCopy) {
      drawCurvedText(ctx, formattedText, {
        centerX: center,
        centerY: center,
        radius: ringRadius,
        fontSize: scaledFontSize,
        color: textColor
      });
    }
  } else if (frameStyle === 'badge') {
    // Subtle perimeter ring + crisp bottom pill badge with horizontal #copy
    const outerRingRadius = 476 * effectiveScale;
    ctx.save();
    ctx.strokeStyle = arcColor;
    ctx.lineWidth = Math.max(16 * effectiveScale, scaledArcWidth * 0.22);
    ctx.beginPath();
    ctx.arc(center, center, outerRingRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    if (hasCopy) {
      ctx.save();
      const pillFontSize = Math.round(scaledFontSize * 0.88);
      ctx.font = `800 ${pillFontSize}px Poppins, Arial, sans-serif`;
      const textMetrics = ctx.measureText(formattedText);
      const padX = Math.max(44 * effectiveScale, scaledArcWidth * 0.45);
      const pillH = Math.max(88 * effectiveScale, scaledArcWidth * 0.78);
      const pillW = Math.min(size * 0.86, Math.max(280 * effectiveScale, textMetrics.width + padX * 2));
      const pillX = center - pillW / 2;
      const pillY = center + 365 * effectiveScale - pillH / 2;

      ctx.shadowColor = 'rgba(0, 0, 0, 0.38)';
      ctx.shadowBlur = 18 * effectiveScale;
      ctx.shadowOffsetY = 6 * effectiveScale;
      ctx.fillStyle = arcColor;
      drawRoundedRectPath(ctx, pillX, pillY, pillW, pillH, pillH / 2);
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.lineWidth = 4 * effectiveScale;
      ctx.strokeStyle = textColor;
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(formattedText, center, pillY + pillH / 2 + 2 * effectiveScale);
      ctx.restore();
    }
  } else if (frameStyle === 'gradient') {
    // Pure 360° gradient perimeter ring with NO text
    ctx.save();
    let ringGrad;
    if (typeof ctx.createConicGradient === 'function') {
      ringGrad = ctx.createConicGradient(-Math.PI / 2, center, center);
      ringGrad.addColorStop(0, arcColor);
      ringGrad.addColorStop(0.5, secondaryColor || '#00E5FF');
      ringGrad.addColorStop(1, arcColor);
    } else {
      ringGrad = ctx.createLinearGradient(0, 0, size, size);
      ringGrad.addColorStop(0, arcColor);
      ringGrad.addColorStop(1, secondaryColor || '#00E5FF');
    }

    const ringStroke = scaledArcWidth;
    const ringRadius = 492 * effectiveScale - ringStroke / 2;

    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = ringStroke;
    ctx.beginPath();
    ctx.arc(center, center, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 4. Optional inner/outer border accent ring
  if (borderWidth > 0) {
    const bw = borderWidth * effectiveScale;
    ctx.save();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = bw;
    if (guideShape === 'rounded-square') {
      const inset = bw / 2 + 12 * effectiveScale;
      drawRoundedRectPath(ctx, inset, inset, size - inset * 2, size - inset * 2, (size - inset * 2) * 0.22);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(center, center, 492 * effectiveScale - bw / 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 5. Optional Crop Guide (never included in exports)
  if (includeGuide) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = Math.max(2, 3 * scaleRatio);
    ctx.setLineDash([14 * scaleRatio, 12 * scaleRatio]);
    if (guideShape === 'rounded-square') {
      const boxSize = 960 * scaleRatio;
      const offset = (size - boxSize) / 2;
      drawRoundedRectPath(ctx, offset, offset, boxSize, boxSize, boxSize * 0.22);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(center, center, 492 * scaleRatio, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
};

const LinkedInProfileMaker = () => {
  const { t, isLiveEditMode, handleLiveEditClick } = useCms();
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageCacheRef = useRef(new Map());

  const [photos, setPhotos] = useState(() => [
    createPhotoEntry({
      id: 'photo-1',
      name: 'STUDIO SAMPLE 01',
      src: samplePortrait
    })
  ]);
  const [activePhotoId, setActivePhotoId] = useState('photo-1');
  const [renderedThumbs, setRenderedThumbs] = useState({});

  // Frame & Design state
  const [frameStyle, setFrameStyle] = useState('arc'); // 'arc' | 'ring' | 'badge' | 'gradient' | 'none'
  const [badgeText, setBadgeText] = useState('#OPEN TO WORK');
  const [arcColor, setArcColor] = useState('#18864B');
  const [secondaryColor, setSecondaryColor] = useState('#00E5FF');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [arcWidth, setArcWidth] = useState(136);
  const [fontSize, setFontSize] = useState(56);
  const [borderWidth, setBorderWidth] = useState(0);
  const [borderColor, setBorderColor] = useState('#FFFFFF');
  const [showGuide, setShowGuide] = useState(true);

  // Preview & Social optimization state
  const [previewTab, setPreviewTab] = useState('apps'); // 'apps' | 'compare' | 'profile'
  const [previewTheme, setPreviewTheme] = useState('split'); // 'light' | 'dark' | 'split'
  const [selectedPlatformId, setSelectedPlatformId] = useState('linkedin');
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [isExportingPack, setIsExportingPack] = useState(false);
  const [notice, setNotice] = useState('READY // 100% LOCAL BROWSER ENGINE');
  const [isDragging, setIsDragging] = useState(false);

  // Add the second sample variation on initial mount so the user can immediately test Compare
  useEffect(() => {
    let active = true;
    createMonochromeSampleVariant(samplePortrait).then((monoSrc) => {
      if (!active || !monoSrc) return;
      setPhotos((prev) => {
        if (prev.length > 1) return prev;
        return [
          ...prev,
          createPhotoEntry({
            id: 'photo-2',
            name: 'STUDIO B&W 02',
            src: monoSrc
          })
        ];
      });
    });
    return () => {
      active = false;
    };
  }, []);

  const activePhoto = useMemo(
    () => photos.find((p) => p.id === activePhotoId) || photos[0],
    [photos, activePhotoId]
  );

  const selectedPlatform = useMemo(
    () => SOCIAL_PLATFORMS.find((p) => p.id === selectedPlatformId) || SOCIAL_PLATFORMS[0],
    [selectedPlatformId]
  );

  const updateActivePhoto = useCallback(
    (updater) => {
      setPhotos((prev) =>
        prev.map((photo) => {
          if (photo.id !== activePhoto.id) return photo;
          const patch = typeof updater === 'function' ? updater(photo) : updater;
          return { ...photo, ...patch };
        })
      );
    },
    [activePhoto]
  );

  const loadImageElement = useCallback((src) => {
    if (!src) return Promise.resolve(null);
    const cached = imageCacheRef.current.get(src);
    if (cached && cached.complete && cached.naturalWidth > 0) {
      return Promise.resolve(cached);
    }
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageCacheRef.current.set(src, img);
        resolve(img);
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }, []);

  // Render active photo to the interactive main canvas
  const renderMainCanvas = useCallback(
    async (includeGuideOverride = showGuide) => {
      const canvas = canvasRef.current;
      if (!canvas || !activePhoto) return false;
      const effectiveSrc = activePhoto.bgRemoved && activePhoto.cutoutSrc
        ? activePhoto.cutoutSrc
        : activePhoto.originalSrc;
      const img = await loadImageElement(effectiveSrc);
      if (!img) {
        setNotice('COULD NOT READ THAT IMAGE');
        return false;
      }

      renderFrameToCanvas(canvas, img, {
        size: OUTPUT_SIZE,
        frameStyle,
        badgeText,
        arcColor,
        secondaryColor,
        textColor,
        zoom: activePhoto.zoom,
        offsetX: activePhoto.offsetX,
        offsetY: activePhoto.offsetY,
        rotation: activePhoto.rotation,
        mirrorX: activePhoto.mirrorX,
        mirrorY: activePhoto.mirrorY,
        arcWidth,
        fontSize,
        bgColor: activePhoto.bgColor,
        borderWidth,
        borderColor,
        includeGuide: includeGuideOverride,
        guideShape: selectedPlatform.shape,
        safeScale: selectedPlatform.safeScale
      });
      return true;
    },
    [
      activePhoto,
      arcColor,
      arcWidth,
      badgeText,
      borderColor,
      borderWidth,
      fontSize,
      frameStyle,
      loadImageElement,
      secondaryColor,
      selectedPlatform,
      showGuide,
      textColor
    ]
  );

  // Render clean preview thumbnails for all uploaded photos (used in slot bar, All Apps, Compare, and On a Profile)
  useEffect(() => {
    let cancelled = false;
    const renderAllPreviews = async () => {
      if (document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch {
          // Proceed if font promise rejects
        }
      }
      await renderMainCanvas(showGuide);

      const offCanvas = document.createElement('canvas');
      const nextThumbs = {};

      for (const photo of photos) {
        const src = photo.bgRemoved && photo.cutoutSrc ? photo.cutoutSrc : photo.originalSrc;
        const img = await loadImageElement(src);
        if (!img || cancelled) continue;

        renderFrameToCanvas(offCanvas, img, {
          size: 512,
          frameStyle,
          badgeText,
          arcColor,
          secondaryColor,
          textColor,
          zoom: photo.zoom,
          offsetX: photo.offsetX,
          offsetY: photo.offsetY,
          rotation: photo.rotation,
          mirrorX: photo.mirrorX,
          mirrorY: photo.mirrorY,
          arcWidth,
          fontSize,
          bgColor: photo.bgColor,
          borderWidth,
          borderColor,
          includeGuide: false,
          guideShape: selectedPlatform.shape,
          safeScale: selectedPlatform.safeScale
        });
        nextThumbs[photo.id] = offCanvas.toDataURL('image/png');
      }

      if (!cancelled) {
        setRenderedThumbs(nextThumbs);
      }
    };

    renderAllPreviews();
    return () => {
      cancelled = true;
    };
  }, [
    photos,
    frameStyle,
    badgeText,
    arcColor,
    secondaryColor,
    textColor,
    arcWidth,
    fontSize,
    borderWidth,
    borderColor,
    selectedPlatform,
    showGuide,
    renderMainCanvas,
    loadImageElement
  ]);

  const handleFilesSelected = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const incomingFiles = Array.from(fileList);

    incomingFiles.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setNotice('CHOOSE A JPG, PNG, WEBP OR AVIF IMAGE');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setNotice('IMAGE IS OVER THE 20 MB LIMIT');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const resultSrc = event.target?.result;
        if (typeof resultSrc !== 'string') return;
        const newId = `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const newEntry = createPhotoEntry({
          id: newId,
          name: file.name.toUpperCase(),
          src: resultSrc,
          bgColor: activePhoto?.bgColor || 'transparent'
        });

        setPhotos((prev) => {
          if (prev.length >= MAX_PHOTOS) {
            // Replace active photo if at max capacity
            return prev.map((p) => (p.id === activePhotoId ? { ...newEntry, id: p.id } : p));
          }
          return [...prev, newEntry];
        });
        setActivePhotoId((prevId) => (photos.length >= MAX_PHOTOS ? prevId : newId));
        setNotice(`UPLOADED ${file.name.toUpperCase()} // COMPARE OR TUNE FRAME`);
      };
      reader.onerror = () => setNotice('COULD NOT READ THAT IMAGE');
      reader.readAsDataURL(file);
    });
  };

  const removePhotoSlot = (photoId, event) => {
    event.stopPropagation();
    if (photos.length <= 1) {
      setNotice('KEEP AT LEAST ONE PHOTO IN WORKBENCH');
      return;
    }
    setPhotos((prev) => {
      const filtered = prev.filter((p) => p.id !== photoId);
      if (activePhotoId === photoId && filtered.length > 0) {
        setActivePhotoId(filtered[0].id);
      }
      return filtered;
    });
    setNotice('PHOTO REMOVED FROM COMPARISON');
  };

  const addSamplePhoto = async () => {
    if (photos.length >= MAX_PHOTOS) {
      setNotice(`MAX ${MAX_PHOTOS} PHOTOS LOADED`);
      return;
    }
    const newId = `photo-sample-${Date.now()}`;
    const useMono = photos.length % 2 === 1;
    const src = useMono ? await createMonochromeSampleVariant(samplePortrait) : samplePortrait;
    setPhotos((prev) => [
      ...prev,
      createPhotoEntry({
        id: newId,
        name: useMono ? `STUDIO B&W 0${prev.length + 1}` : `STUDIO SAMPLE 0${prev.length + 1}`,
        src
      })
    ]);
    setActivePhotoId(newId);
    setNotice('SAMPLE PORTRAIT ADDED TO SLOTS');
  };

  const handleToggleRemoveBg = async () => {
    if (!activePhoto) return;
    if (activePhoto.bgRemoved) {
      updateActivePhoto({ bgRemoved: false });
      setNotice('ORIGINAL PHOTO BACKGROUND RESTORED');
      return;
    }

    setIsRemovingBg(true);
    setNotice('RUNNING LOCAL AI PORTRAIT BACKGROUND REMOVAL...');
    const cutout = await removeImageBackgroundLocal(activePhoto.originalSrc, activePhoto.bgTolerance);
    setIsRemovingBg(false);
    if (cutout) {
      updateActivePhoto((photo) => ({
        bgRemoved: true,
        cutoutSrc: cutout,
        bgColor: photo.bgColor === 'transparent' ? '#FF6A00' : photo.bgColor
      }));
      setNotice('BACKGROUND REMOVED LOCALLY // PICK ANY BACKGROUND COLOR');
    } else {
      setNotice('COULD NOT SEGMENT BACKGROUND');
    }
  };

  const handleToleranceChange = async (newTolerance) => {
    if (!activePhoto) return;
    updateActivePhoto({ bgTolerance: newTolerance });
    if (activePhoto.bgRemoved) {
      const cutout = await removeImageBackgroundLocal(activePhoto.originalSrc, newTolerance);
      if (cutout) {
        updateActivePhoto({ cutoutSrc: cutout });
      }
    }
  };

  const handleSelectBgColor = async (colorValue) => {
    if (!activePhoto) return;
    if (colorValue !== 'transparent' && !activePhoto.bgRemoved) {
      setIsRemovingBg(true);
      setNotice('ISOLATING PORTRAIT TO APPLY BACKGROUND COLOR...');
      const cutout = activePhoto.cutoutSrc || (await removeImageBackgroundLocal(activePhoto.originalSrc, activePhoto.bgTolerance));
      setIsRemovingBg(false);
      updateActivePhoto({
        bgRemoved: true,
        cutoutSrc: cutout,
        bgColor: colorValue
      });
      setNotice(`BACKGROUND COLOR ${colorValue.toUpperCase()} APPLIED`);
    } else {
      updateActivePhoto({ bgColor: colorValue });
      setNotice(
        colorValue === 'transparent'
          ? 'TRANSPARENT BACKGROUND SELECTED'
          : `BACKGROUND COLOR ${colorValue.toUpperCase()} APPLIED`
      );
    }
  };

  const applyPreset = (preset) => {
    setBadgeText(ensureHashtag(preset.text));
    setArcColor(preset.color);
    if (preset.secondaryColor) setSecondaryColor(preset.secondaryColor);
    setTextColor(preset.textColor);
    if (frameStyle === 'none') setFrameStyle('arc');
    setNotice(`${ensureHashtag(preset.label)} PRESET APPLIED`);
  };

  const resetPhotoTransform = () => {
    updateActivePhoto({
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      mirrorX: false,
      mirrorY: false
    });
    setNotice('PHOTO POSITION, ROTATION & MIRROR RESET');
  };

  const resetDesign = () => {
    setFrameStyle('arc');
    setBadgeText('#OPEN TO WORK');
    setArcColor('#18864B');
    setSecondaryColor('#00E5FF');
    setTextColor('#FFFFFF');
    setArcWidth(136);
    setFontSize(56);
    setBorderWidth(0);
    setBorderColor('#FFFFFF');
    setShowGuide(true);
    updateActivePhoto({
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      mirrorX: false,
      mirrorY: false,
      bgRemoved: false,
      bgColor: 'transparent',
      bgTolerance: 38
    });
    setNotice('ALL FRAME & PHOTO SETTINGS RESET');
  };

  const exportPlatformImage = useCallback(
    async (platform = selectedPlatform) => {
      if (!activePhoto) return;
      const effectiveSrc = activePhoto.bgRemoved && activePhoto.cutoutSrc
        ? activePhoto.cutoutSrc
        : activePhoto.originalSrc;
      const img = await loadImageElement(effectiveSrc);
      if (!img) {
        setNotice('EXPORT FAILED // IMAGE NOT READY');
        return;
      }

      const exportCanvas = document.createElement('canvas');
      renderFrameToCanvas(exportCanvas, img, {
        size: platform.size,
        frameStyle,
        badgeText,
        arcColor,
        secondaryColor,
        textColor,
        zoom: activePhoto.zoom,
        offsetX: activePhoto.offsetX,
        offsetY: activePhoto.offsetY,
        rotation: activePhoto.rotation,
        mirrorX: activePhoto.mirrorX,
        mirrorY: activePhoto.mirrorY,
        arcWidth,
        fontSize,
        bgColor: activePhoto.bgColor,
        borderWidth,
        borderColor,
        includeGuide: false,
        guideShape: platform.shape,
        safeScale: platform.safeScale
      });

      return new Promise((resolve) => {
        exportCanvas.toBlob((blob) => {
          if (!blob) {
            setNotice('EXPORT FAILED // TRY AGAIN');
            resolve(false);
            return;
          }
          const objectUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = objectUrl;
          link.download = `rynell-${platform.id}-profile-${platform.size}x${platform.size}.png`;
          link.click();
          setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
          setNotice(`${platform.name.toUpperCase()} OPTIMIZED ${platform.size}×${platform.size} PNG DOWNLOADED`);
          resolve(true);
        }, 'image/png');
      });
    },
    [
      activePhoto,
      arcColor,
      arcWidth,
      badgeText,
      borderColor,
      borderWidth,
      fontSize,
      frameStyle,
      loadImageElement,
      secondaryColor,
      selectedPlatform,
      textColor
    ]
  );

  const downloadAllSocialsPack = async () => {
    if (isExportingPack) return;
    setIsExportingPack(true);
    setNotice('GENERATING OPTIMIZED PNGS FOR ALL 10 SOCIAL PLATFORMS...');
    for (let i = 0; i < SOCIAL_PLATFORMS.length; i++) {
      const platform = SOCIAL_PLATFORMS[i];
      await exportPlatformImage(platform);
      await new Promise((r) => setTimeout(r, 140));
    }
    setIsExportingPack(false);
    setNotice('ALL 10 SOCIAL PROFILE PICTURES EXPORTED');
  };

  const handlePointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.dataset.pointerX = String(event.clientX);
    event.currentTarget.dataset.pointerY = String(event.clientY);
    setIsDragging(true);
  };

  const handlePointerMove = (event) => {
    if (!isDragging) return;
    const target = event.currentTarget;
    const previousX = Number(target.dataset.pointerX || event.clientX);
    const previousY = Number(target.dataset.pointerY || event.clientY);
    const bounds = target.getBoundingClientRect();
    const deltaX = ((event.clientX - previousX) / bounds.width) * 120;
    const deltaY = ((event.clientY - previousY) / bounds.height) * 120;

    updateActivePhoto((photo) => ({
      offsetX: Math.max(-100, Math.min(100, photo.offsetX + deltaX)),
      offsetY: Math.max(-100, Math.min(100, photo.offsetY + deltaY))
    }));
    target.dataset.pointerX = String(event.clientX);
    target.dataset.pointerY = String(event.clientY);
  };

  const stopDragging = () => setIsDragging(false);

  const activeThumbUrl = renderedThumbs[activePhoto?.id] || activePhoto?.originalSrc || samplePortrait;

  return (
    <section id="profile-photo-maker" className="profile-maker-section bg-halftone">
      <div
        className={`section-label ${isLiveEditMode ? 'cms-editable-target' : ''}`}
        onClick={(event) => handleLiveEditClick(event, 'studioTools.profileMaker.sectionLabel')}
      >
        {t('studioTools.profileMaker.sectionLabel', 'PROFILE PHOTO LAB')}
      </div>

      <div className="container profile-maker-container">
        <header className="profile-maker-header">
          <div>
            <div className="profile-kicker"><span /> FREE CREATOR TOOL // 10 SOCIAL PLATFORMS // NO SIGN-UP</div>
            <h2
              className={`profile-maker-title ${isLiveEditMode ? 'cms-editable-target' : ''}`}
              onClick={(event) => handleLiveEditClick(event, 'studioTools.profileMaker.title')}
            >
              {t('studioTools.profileMaker.title', 'MAKE YOUR PROFILE PICTURE HIT HARDER.')}
            </h2>
            <p
              className={`profile-maker-subtitle ${isLiveEditMode ? 'cms-editable-target' : ''}`}
              onClick={(event) => handleLiveEditClick(event, 'studioTools.profileMaker.subDescription')}
            >
              {t(
                'studioTools.profileMaker.subDescription',
                'Upload multiple portraits, remove backgrounds locally, test Arc, Ring, Badge & Gradient frames, and export optimized avatars for LinkedIn, Instagram, TikTok, Slack, Facebook, X, Threads, Discord, WhatsApp, and YouTube.'
              )}
            </p>
          </div>
          <div className="profile-local-stamp">100%<br />LOCAL</div>
        </header>

        <div className="profile-workbench">
          <div className="profile-workbench-bar">
            <span className="profile-status-dot" />
            <span>PROFILE FRAME ENGINE // MULTI-SOCIAL STUDIO</span>
            <span className="profile-workbench-meta">
              ACTIVE TARGET: {selectedPlatform.name.toUpperCase()} ({selectedPlatform.size} × {selectedPlatform.size} PX)
            </span>
          </div>

          <div className="profile-workbench-grid">
            {/* LEFT PANEL: PHOTO SLOTS, INTERACTIVE STAGE, FRAME, TRANSFORM & BACKGROUND CONTROLS */}
            <div className="profile-control-panel">
              <div className="profile-panel-heading">
                <span>01 / YOUR PHOTOS ({photos.length}/{MAX_PHOTOS})</span>
                <div className="profile-heading-actions">
                  <button type="button" className="profile-reset-btn" onClick={addSamplePhoto}>
                    + TRY SAMPLE
                  </button>
                  <button type="button" className="profile-reset-btn" onClick={resetDesign}>
                    RESET ALL
                  </button>
                </div>
              </div>

              {/* Multi-Photo Upload Slot Bar */}
              <div className="profile-slots-bar">
                <div className="profile-slots-list" role="list" aria-label="Uploaded photos">
                  {photos.map((photo, index) => {
                    const isSelected = photo.id === activePhoto?.id;
                    const thumb = renderedThumbs[photo.id] || photo.originalSrc;
                    return (
                      <div
                        key={photo.id}
                        role="listitem"
                        className={`profile-slot-item ${isSelected ? 'active' : ''}`}
                      >
                        <button
                          type="button"
                          className="profile-slot-thumb-btn"
                          onClick={() => {
                            setActivePhotoId(photo.id);
                            setNotice(`SELECTED PHOTO #${index + 1} (${photo.name})`);
                          }}
                          title={`Select photo ${index + 1}: ${photo.name}`}
                        >
                          <img src={thumb} alt={photo.name} />
                          <span className="profile-slot-index">{index + 1}</span>
                        </button>
                        {photos.length > 1 && (
                          <button
                            type="button"
                            className="profile-slot-remove"
                            onClick={(event) => removePhotoSlot(photo.id, event)}
                            aria-label={`Remove photo ${index + 1}`}
                            title="Remove photo"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {photos.length < MAX_PHOTOS && (
                    <button
                      type="button"
                      className="profile-slot-add"
                      onClick={() => fileInputRef.current?.click()}
                      title="Upload another portrait to compare"
                      aria-label="Add another photo"
                    >
                      <span>+</span>
                    </button>
                  )}
                </div>

                <div
                  className="profile-upload-zone"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    handleFilesSelected(event.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex="0"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') fileInputRef.current?.click();
                  }}
                  aria-label="Upload portrait images"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={(event) => {
                      handleFilesSelected(event.target.files);
                      event.target.value = '';
                    }}
                    hidden
                  />
                  <span className="profile-upload-icon">↥</span>
                  <span>
                    <strong>ADD / COMPARE PORTRAITS</strong>
                    <small>{activePhoto?.name} // UPLOAD UP TO {MAX_PHOTOS} PHOTOS</small>
                  </span>
                  <span className="profile-upload-action">ADD PHOTO</span>
                </div>
              </div>

              {/* Interactive Canvas Stage */}
              <div className="profile-editor-stage-wrap">
                <div
                  className={`profile-canvas-wrap ${selectedPlatform.shape === 'rounded-square' ? 'rounded-square' : ''} ${isDragging ? 'dragging' : ''}`}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={stopDragging}
                  onPointerCancel={stopDragging}
                  onPointerLeave={stopDragging}
                >
                  <canvas
                    ref={canvasRef}
                    width={OUTPUT_SIZE}
                    height={OUTPUT_SIZE}
                    aria-label="Interactive profile photo frame canvas"
                  />
                </div>
                <div className="profile-drag-hint">
                  <span>✥ DRAG TO MOVE · USE CONTROLS BELOW TO ROTATE, MIRROR & ZOOM</span>
                  <label className="profile-check-label">
                    <input
                      type="checkbox"
                      checked={showGuide}
                      onChange={(event) => setShowGuide(event.target.checked)}
                    />
                    CROP GUIDE
                  </label>
                </div>
              </div>

              {/* 5 Frame Selector: Arc, Ring, Badge, Gradient, None */}
              <div className="profile-control-block">
                <div className="profile-control-label">
                  <span>FRAME STYLE</span>
                  <span>{FRAME_STYLES.find((f) => f.id === frameStyle)?.label}</span>
                </div>
                <div className="profile-frame-tabs" role="radiogroup" aria-label="Frame style">
                  {FRAME_STYLES.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      role="radio"
                      aria-checked={frameStyle === style.id}
                      className={`profile-frame-tab ${frameStyle === style.id ? 'active' : ''}`}
                      onClick={() => {
                        setFrameStyle(style.id);
                        setNotice(`${style.label} FRAME SELECTED`);
                      }}
                    >
                      <span className="profile-frame-tab-icon">{style.icon}</span>
                      <span>{style.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Badge Copy Input (Always starts with #) + Presets */}
              {frameStyle !== 'none' && frameStyle !== 'gradient' && (
                <div className="profile-control-block">
                  <label className="profile-control-label" htmlFor="profile-badge-text">
                    <span>BADGE COPY (AUTO # PREFIX)</span>
                    <span>{badgeText.length}/28</span>
                  </label>
                  <input
                    id="profile-badge-text"
                    className="profile-text-input"
                    value={badgeText}
                    maxLength={28}
                    onChange={(event) => setBadgeText(ensureHashtag(event.target.value))}
                    placeholder="#YOUR MESSAGE"
                  />
                  <div className="profile-preset-row">
                    {FRAME_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        className={`profile-preset-chip ${badgeText === preset.text ? 'active' : ''}`}
                        onClick={() => applyPreset(preset)}
                      >
                        <span style={{ background: preset.color }} />
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Frame Color, Secondary Gradient Color & Text Color + Thickness/Type Size */}
              {frameStyle !== 'none' && (
                <>
                  <div className="profile-color-grid">
                    <label className="profile-color-control">
                      <span>{frameStyle === 'gradient' ? 'GRADIENT START' : 'FRAME COLOR'}</span>
                      <span className="profile-color-value">
                        <input
                          type="color"
                          value={arcColor}
                          onChange={(event) => setArcColor(event.target.value)}
                          aria-label={frameStyle === 'gradient' ? 'Gradient start color' : 'Frame color'}
                        />
                        <strong>{arcColor.toUpperCase()}</strong>
                      </span>
                    </label>
                    {frameStyle === 'gradient' ? (
                      <label className="profile-color-control">
                        <span>GRADIENT END</span>
                        <span className="profile-color-value">
                          <input
                            type="color"
                            value={secondaryColor}
                            onChange={(event) => setSecondaryColor(event.target.value)}
                            aria-label="Gradient end color"
                          />
                          <strong>{secondaryColor.toUpperCase()}</strong>
                        </span>
                      </label>
                    ) : (
                      <label className="profile-color-control">
                        <span>TEXT COLOR</span>
                        <span className="profile-color-value">
                          <input
                            type="color"
                            value={textColor}
                            onChange={(event) => setTextColor(event.target.value)}
                            aria-label="Text color"
                          />
                          <strong>{textColor.toUpperCase()}</strong>
                        </span>
                      </label>
                    )}
                  </div>

                  <div className="profile-range-grid" style={frameStyle === 'gradient' ? { gridTemplateColumns: '1fr' } : undefined}>
                    <label className="profile-range-control">
                      <span>
                        <b>FRAME THICKNESS</b>
                        <em>{arcWidth} PX</em>
                      </span>
                      <input
                        type="range"
                        min="40"
                        max="196"
                        step="2"
                        value={arcWidth}
                        onChange={(event) => setArcWidth(Number(event.target.value))}
                      />
                    </label>
                    {frameStyle !== 'gradient' && (
                      <label className="profile-range-control">
                        <span>
                          <b>TYPE SIZE</b>
                          <em>{fontSize} PX</em>
                        </span>
                        <input
                          type="range"
                          min="34"
                          max="74"
                          step="1"
                          value={fontSize}
                          onChange={(event) => setFontSize(Number(event.target.value))}
                        />
                      </label>
                    )}
                  </div>
                </>
              )}

              {/* Photo Zoom, Rotate & Mirror Controls */}
              <div className="profile-control-block profile-section-divider">
                <div className="profile-control-label">
                  <span>PHOTO ZOOM, ROTATE & MIRROR</span>
                  <button type="button" className="profile-center-btn" onClick={resetPhotoTransform}>
                    ↺ RESET TRANSFORM
                  </button>
                </div>

                <label className="profile-range-control">
                  <span>
                    <b>PHOTO ZOOM</b>
                    <em>{(activePhoto?.zoom || 1).toFixed(2)}×</em>
                  </span>
                  <input
                    type="range"
                    min="1"
                    max="2.5"
                    step="0.01"
                    value={activePhoto?.zoom || 1}
                    onChange={(event) => updateActivePhoto({ zoom: Number(event.target.value) })}
                  />
                </label>

                <label className="profile-range-control" style={{ marginTop: '.65rem' }}>
                  <span>
                    <b>FINE ROTATION ANGLE</b>
                    <em>{activePhoto?.rotation || 0}°</em>
                  </span>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="1"
                    value={activePhoto?.rotation || 0}
                    onChange={(event) => updateActivePhoto({ rotation: Number(event.target.value) })}
                  />
                </label>

                <div className="profile-transform-actions">
                  <button
                    type="button"
                    className="profile-action-chip"
                    onClick={() =>
                      updateActivePhoto((p) => {
                        const next = ((p.rotation - 90 + 540) % 360) - 180;
                        return { rotation: next };
                      })
                    }
                  >
                    ↺ ROTATE -90°
                  </button>
                  <button
                    type="button"
                    className="profile-action-chip"
                    onClick={() =>
                      updateActivePhoto((p) => {
                        const next = ((p.rotation + 90 + 540) % 360) - 180;
                        return { rotation: next === -180 ? 180 : next };
                      })
                    }
                  >
                    ↻ ROTATE +90°
                  </button>
                  <button
                    type="button"
                    className={`profile-action-chip ${activePhoto?.mirrorX ? 'active' : ''}`}
                    onClick={() => updateActivePhoto((p) => ({ mirrorX: !p.mirrorX }))}
                  >
                    ⇄ MIRROR H
                  </button>
                  <button
                    type="button"
                    className={`profile-action-chip ${activePhoto?.mirrorY ? 'active' : ''}`}
                    onClick={() => updateActivePhoto((p) => ({ mirrorY: !p.mirrorY }))}
                  >
                    ⇅ MIRROR V
                  </button>
                </div>
              </div>

              {/* Background Removal & Background Color Controls */}
              <div className="profile-control-block profile-section-divider">
                <div className="profile-control-label">
                  <span>BACKGROUND REMOVAL & COLOR</span>
                  <span>{activePhoto?.bgRemoved ? 'CUTOUT ACTIVE' : 'ORIGINAL BG'}</span>
                </div>

                <div className="profile-bg-top-row">
                  <button
                    type="button"
                    className={`profile-remove-bg-btn ${activePhoto?.bgRemoved ? 'active' : ''}`}
                    onClick={handleToggleRemoveBg}
                    disabled={isRemovingBg}
                  >
                    <span>✨</span>
                    <span>
                      {isRemovingBg
                        ? 'REMOVING BACKGROUND...'
                        : activePhoto?.bgRemoved
                          ? 'BACKGROUND REMOVED (RESTORE)'
                          : 'REMOVE BACKGROUND'}
                    </span>
                    <em className="profile-ai-pill">AI</em>
                  </button>
                </div>

                {activePhoto?.bgRemoved && (
                  <label className="profile-range-control" style={{ marginTop: '.7rem' }}>
                    <span>
                      <b>EDGE CUTOUT SENSITIVITY</b>
                      <em>{activePhoto.bgTolerance}</em>
                    </span>
                    <input
                      type="range"
                      min="16"
                      max="72"
                      step="2"
                      value={activePhoto.bgTolerance}
                      onChange={(event) => handleToleranceChange(Number(event.target.value))}
                    />
                  </label>
                )}

                <div className="profile-bg-swatches" role="radiogroup" aria-label="Background color">
                  {BG_COLOR_SWATCHES.map((swatch) => {
                    const isSelected = (activePhoto?.bgColor || 'transparent') === swatch.value;
                    return (
                      <button
                        key={swatch.id}
                        type="button"
                        className={`profile-bg-swatch ${swatch.value === 'transparent' ? 'checker' : ''} ${isSelected ? 'active' : ''}`}
                        style={swatch.value !== 'transparent' ? { background: swatch.value } : undefined}
                        onClick={() => handleSelectBgColor(swatch.value)}
                        title={`Background: ${swatch.label}`}
                        aria-label={`Background: ${swatch.label}`}
                      />
                    );
                  })}
                  <label className="profile-bg-custom-picker" title="Custom background color">
                    <input
                      type="color"
                      value={
                        activePhoto?.bgColor && activePhoto.bgColor !== 'transparent'
                          ? activePhoto.bgColor
                          : '#FF6A00'
                      }
                      onChange={(event) => handleSelectBgColor(event.target.value)}
                      aria-label="Custom background color"
                    />
                    <span>✎</span>
                  </label>
                </div>

                <p className="profile-bg-privacy-hint">
                  🔒 Runs 100% in your browser so your portrait is never uploaded. Works best on portraits with a clear backdrop.
                </p>
              </div>

              {/* Border Ring Accent */}
              <div className="profile-control-block profile-section-divider">
                <div className="profile-control-label">
                  <span>OUTER BORDER RING</span>
                  <span>{borderWidth} PX</span>
                </div>
                <div className="profile-border-row">
                  <input
                    type="range"
                    min="0"
                    max="28"
                    step="2"
                    value={borderWidth}
                    onChange={(event) => setBorderWidth(Number(event.target.value))}
                  />
                  <input
                    type="color"
                    value={borderColor}
                    onChange={(event) => {
                      setBorderColor(event.target.value);
                      if (borderWidth === 0) setBorderWidth(12);
                    }}
                    aria-label="Outer border color"
                  />
                </div>
              </div>

              {/* Profile Picture Quality Diagnostics */}
              <div className="profile-quality-card">
                <div className="profile-quality-title">✓ IS THIS A GOOD PROFILE PICTURE?</div>
                <ul>
                  <li>
                    <span>●</span> Sharp: Optimized export is {selectedPlatform.size} × {selectedPlatform.size} px for {selectedPlatform.name}.
                  </li>
                  <li>
                    <span>●</span> {frameStyle === 'gradient' ? 'Frame style: Gradient 360° ring without text overlay.' : frameStyle === 'none' ? 'Clean portrait mode with no frame or text overlay.' : <>Copy starts with <strong>{badgeText}</strong> and stays legible down to 32 px.</>}
                  </li>
                  <li>
                    <span>●</span> Contrasts cleanly in both light and dark mode across all 10 social apps.
                  </li>
                </ul>
              </div>
            </div>

            {/* RIGHT PANEL: ALL APPS, COMPARE & ON A PROFILE PREVIEWS + MULTI-SOCIAL OPTIMIZER */}
            <div className="profile-preview-panel">
              <div className="profile-preview-toolbar">
                <div className="profile-view-tabs" role="tablist" aria-label="Preview view mode">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={previewTab === 'apps'}
                    className={`profile-view-tab ${previewTab === 'apps' ? 'active' : ''}`}
                    onClick={() => setPreviewTab('apps')}
                  >
                    ⊞ ALL APPS (10)
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={previewTab === 'compare'}
                    className={`profile-view-tab ${previewTab === 'compare' ? 'active' : ''}`}
                    onClick={() => setPreviewTab('compare')}
                  >
                    ▥ COMPARE ({photos.length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={previewTab === 'profile'}
                    className={`profile-view-tab ${previewTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setPreviewTab('profile')}
                  >
                    📱 ON A PROFILE
                  </button>
                </div>

                <div className="profile-theme-pills" role="group" aria-label="Preview theme mode">
                  <button
                    type="button"
                    className={previewTheme === 'light' ? 'active' : ''}
                    onClick={() => setPreviewTheme('light')}
                    title="Light mode preview"
                  >
                    ☀ LIGHT
                  </button>
                  <button
                    type="button"
                    className={previewTheme === 'dark' ? 'active' : ''}
                    onClick={() => setPreviewTheme('dark')}
                    title="Dark mode preview"
                  >
                    ☾ DARK
                  </button>
                  <button
                    type="button"
                    className={previewTheme === 'split' ? 'active' : ''}
                    onClick={() => setPreviewTheme('split')}
                    title="Split light & dark preview"
                  >
                    ◐ SPLIT
                  </button>
                </div>
              </div>

              {/* Social Optimization Target Bar (All 10 Socials) */}
              <div className="profile-social-target-bar">
                <div className="profile-social-target-header">
                  <span>OPTIMIZE & EXPORT FOR SOCIAL PLATFORM:</span>
                  <button
                    type="button"
                    className="profile-export-all-inline"
                    onClick={downloadAllSocialsPack}
                    disabled={isExportingPack}
                  >
                    {isExportingPack ? 'EXPORTING 10 PNGS...' : '⬇ DOWNLOAD ALL 10 SOCIALS PACK'}
                  </button>
                </div>
                <div className="profile-social-pills">
                  {SOCIAL_PLATFORMS.map((platform) => {
                    const isCurrent = platform.id === selectedPlatform.id;
                    return (
                      <button
                        key={platform.id}
                        type="button"
                        className={`profile-social-pill ${isCurrent ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedPlatformId(platform.id);
                          setNotice(`OPTIMIZED TARGET SET TO ${platform.name.toUpperCase()} (${platform.size}×${platform.size} PX)`);
                        }}
                      >
                        <span className="profile-social-badge" style={{ background: platform.accent }}>
                          {platform.shortName}
                        </span>
                        <span>{platform.name}</span>
                        <small>{platform.size}px</small>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* VIEW 1: ALL APPS (LinkedIn, Instagram, TikTok, Slack, Facebook, X, Threads, Discord, WhatsApp, YouTube) */}
              {previewTab === 'apps' && (
                <div className="profile-apps-scroll">
                  {SOCIAL_PLATFORMS.map((platform) => {
                    const isRoundedSquare = platform.shape === 'rounded-square';
                    const modes =
                      previewTheme === 'light'
                        ? ['light']
                        : previewTheme === 'dark'
                          ? ['dark']
                          : ['light', 'dark'];

                    return (
                      <article key={platform.id} className="profile-social-card">
                        <header className="profile-social-card-head">
                          <div className="profile-social-card-title">
                            <span className="profile-social-icon" style={{ background: platform.accent }}>
                              {platform.shortName}
                            </span>
                            <strong>{platform.name}</strong>
                            <span className="profile-social-spec">
                              {platform.size} × {platform.size} PX · {isRoundedSquare ? 'ROUNDED SQUARE' : 'CIRCLE'}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="profile-social-export-btn"
                            onClick={() => exportPlatformImage(platform)}
                          >
                            EXPORT {platform.name.toUpperCase()} PNG ↓
                          </button>
                        </header>

                        <div className={`profile-social-modes ${modes.length === 1 ? 'single-mode' : ''}`}>
                          {modes.map((mode) => (
                            <div key={mode} className={`profile-social-pane ${mode}`}>
                              {/* Main Profile Row */}
                              <div className="profile-mock-hero">
                                <div
                                  className={`profile-avatar-shell lg ${isRoundedSquare ? 'rounded-square' : ''} ${platform.storyRing ? 'story-ring' : ''}`}
                                >
                                  <img src={activeThumbUrl} alt={`${platform.name} profile preview`} />
                                  {platform.statusDot && (
                                    <span
                                      className="profile-status-indicator"
                                      style={{ background: platform.statusDot }}
                                    />
                                  )}
                                </div>
                                <div className="profile-mock-user">
                                  <strong>Your Name</strong>
                                  <span>@yourname</span>
                                </div>
                              </div>

                              {/* Post + Story Row */}
                              <div className="profile-mock-row">
                                {platform.storyRing && (
                                  <div className="profile-mock-story">
                                    <div className="profile-avatar-shell md story-ring">
                                      <img src={activeThumbUrl} alt="Story ring preview" />
                                    </div>
                                    <small>STORY</small>
                                  </div>
                                )}
                                <div className="profile-mock-item">
                                  <div className="profile-mock-inline">
                                    <div className={`profile-avatar-shell sm ${isRoundedSquare ? 'rounded-square' : ''}`}>
                                      <img src={activeThumbUrl} alt="Post avatar" />
                                    </div>
                                    <div>
                                      <strong>Your Name</strong>
                                      <span>@yourname</span>
                                    </div>
                                  </div>
                                  <small>POST · 48 PX</small>
                                </div>
                              </div>

                              {/* Comment Row */}
                              <div className="profile-mock-item">
                                <div className="profile-mock-inline">
                                  <div className={`profile-avatar-shell xs ${isRoundedSquare ? 'rounded-square' : ''}`}>
                                    <img src={activeThumbUrl} alt="Comment avatar" />
                                  </div>
                                  <div className="profile-mock-bubble">
                                    <strong>yourname</strong> Love this 🙌
                                  </div>
                                </div>
                                <small>COMMENT · 32 PX</small>
                              </div>

                              {/* Chats / DM Row */}
                              <div className="profile-mock-item">
                                <div className="profile-mock-inline">
                                  <div className={`profile-avatar-shell sm ${isRoundedSquare ? 'rounded-square' : ''}`}>
                                    <img src={activeThumbUrl} alt="Chat avatar" />
                                  </div>
                                  <div>
                                    <strong>Your Name</strong>
                                    <span>Sounds good, see you t...</span>
                                  </div>
                                </div>
                                <small>CHATS · 40 PX</small>
                              </div>
                            </div>
                          ))}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {/* VIEW 2: COMPARE UPLOADED PHOTOS SIDE BY SIDE (128px, 72px, 48px, 32px, 24px in Light & Dark) */}
              {previewTab === 'compare' && (
                <div className="profile-compare-wrap">
                  {(previewTheme === 'light'
                    ? ['light']
                    : previewTheme === 'dark'
                      ? ['dark']
                      : ['light', 'dark']
                  ).map((mode) => (
                    <div key={mode} className={`profile-compare-card ${mode}`}>
                      <div
                        className="profile-compare-header"
                        style={{ gridTemplateColumns: `84px repeat(${photos.length}, minmax(110px, 1fr))` }}
                      >
                        <span className="profile-compare-mode-tag">{mode.toUpperCase()}</span>
                        {photos.map((photo, idx) => {
                          const isChosen = photo.id === activePhoto?.id;
                          return (
                            <div key={photo.id} className="profile-compare-col-head">
                              <button
                                type="button"
                                className={`profile-compare-choose-btn ${isChosen ? 'chosen' : ''}`}
                                onClick={() => {
                                  setActivePhotoId(photo.id);
                                  setNotice(`PHOTO #${idx + 1} SELECTED AS ACTIVE`);
                                }}
                              >
                                {isChosen ? 'CHOSEN' : `USE PHOTO ${idx + 1}`}
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {[128, 72, 48, 32, 24].map((pxSize) => (
                        <div
                          key={pxSize}
                          className="profile-compare-row"
                          style={{ gridTemplateColumns: `84px repeat(${photos.length}, minmax(110px, 1fr))` }}
                        >
                          <span className="profile-compare-px">{pxSize} px</span>
                          {photos.map((photo, idx) => {
                            const thumb = renderedThumbs[photo.id] || photo.originalSrc;
                            const isRoundedSquare = selectedPlatform.shape === 'rounded-square';
                            return (
                              <div key={photo.id} className="profile-compare-cell">
                                <img
                                  src={thumb}
                                  alt={`Photo ${idx + 1} at ${pxSize}px`}
                                  style={{
                                    width: `${pxSize}px`,
                                    height: `${pxSize}px`,
                                    borderRadius: isRoundedSquare ? '22%' : '50%'
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* VIEW 3: ON A PROFILE (Mobile Phone Mockup across any selected social platform) */}
              {previewTab === 'profile' && (
                <div className="profile-phone-stage">
                  <div className={`profile-phone-mockup ${previewTheme === 'dark' ? 'dark' : 'light'}`}>
                    <div className="profile-phone-statusbar">
                      <span>9:41</span>
                      <div className="profile-phone-island" />
                      <span>5G ▮</span>
                    </div>

                    <div className="profile-phone-searchbar">
                      <img
                        src={activeThumbUrl}
                        alt="Mini nav avatar"
                        style={{ borderRadius: selectedPlatform.shape === 'rounded-square' ? '22%' : '50%' }}
                      />
                      <div className="profile-phone-search-pill">🔍 Search {selectedPlatform.name}</div>
                      <span>💬</span>
                    </div>

                    <div
                      className="profile-phone-banner"
                      style={{
                        background: `linear-gradient(120deg, ${selectedPlatform.accent}, ${arcColor})`
                      }}
                    />

                    <div className="profile-phone-body">
                      <div
                        className={`profile-phone-main-avatar ${selectedPlatform.shape === 'rounded-square' ? 'rounded-square' : ''} ${selectedPlatform.storyRing ? 'story-ring' : ''}`}
                      >
                        <img src={activeThumbUrl} alt="Phone profile avatar" />
                      </div>

                      <div className="profile-phone-identity">
                        <h4>Your Name</h4>
                        <p>{selectedPlatform.bio}</p>
                        <small>{selectedPlatform.meta}</small>
                      </div>

                      <div className="profile-phone-cta-row">
                        <button
                          type="button"
                          className="profile-phone-cta-primary"
                          style={{ background: selectedPlatform.accent }}
                        >
                          {selectedPlatform.actionPrimary}
                        </button>
                        <button type="button" className="profile-phone-cta-secondary">
                          {selectedPlatform.actionSecondary}
                        </button>
                      </div>

                      <div className="profile-phone-feed-section">
                        <div className="profile-phone-feed-label">POST · 48 PX</div>
                        <div className="profile-phone-post">
                          <img
                            src={activeThumbUrl}
                            alt="Post 48px avatar"
                            className="sz-48"
                            style={{ borderRadius: selectedPlatform.shape === 'rounded-square' ? '22%' : '50%' }}
                          />
                          <div>
                            <strong>Your Name · You</strong>
                            <span>{selectedPlatform.bio.slice(0, 44)}...</span>
                            <div className="profile-phone-skeleton-lines">
                              <span />
                              <span />
                            </div>
                          </div>
                        </div>

                        <div className="profile-phone-feed-label">COMMENT · 32 PX</div>
                        <div className="profile-phone-comment">
                          <img
                            src={activeThumbUrl}
                            alt="Comment 32px avatar"
                            className="sz-32"
                            style={{ borderRadius: selectedPlatform.shape === 'rounded-square' ? '22%' : '50%' }}
                          />
                          <div className="profile-phone-comment-box">
                            <strong>Your Name</strong>
                            <span>Looks super sharp at both 48 px and 32 px!</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="profile-preview-note">
                    <span>○</span> Previewing your framed avatar on a mobile <strong>{selectedPlatform.name}</strong> profile, next to a post (48 px) and a comment (32 px) where the frame must stay readable.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="profile-export-bar">
            <span className="profile-notice" aria-live="polite">{notice}</span>
            <div className="profile-privacy-note">
              <span>●</span> YOUR PHOTOS NEVER LEAVE THIS DEVICE
            </div>
            <div className="profile-export-buttons">
              <button
                type="button"
                className="profile-download-pack-btn"
                onClick={downloadAllSocialsPack}
                disabled={isExportingPack}
              >
                {isExportingPack ? 'EXPORTING PACK...' : 'EXPORT ALL 10 SOCIALS'}
              </button>
              <button
                type="button"
                className="profile-download-btn"
                onClick={() => exportPlatformImage(selectedPlatform)}
              >
                DOWNLOAD {selectedPlatform.name.toUpperCase()} ({selectedPlatform.size}×{selectedPlatform.size}) <span>↓</span>
              </button>
            </div>
          </div>
        </div>

        <div className="profile-steps">
          <span><b>01</b> UPLOAD & COMPARE MULTIPLE PORTRAITS</span>
          <span><b>02</b> PICK FRAME, #COPY, ROTATION & BG COLOR</span>
          <span><b>03</b> EXPORT OPTIMIZED FOR ALL 10 SOCIALS</span>
        </div>
        <p className="profile-disclaimer">
          Independent creator tool. Not affiliated with or endorsed by LinkedIn, Instagram, TikTok, Slack, Facebook, X, Threads, Discord, WhatsApp, or YouTube.
        </p>
      </div>

      <style>{`
        .profile-maker-section { position: relative; padding: 8rem 0 6rem; background: var(--bg-primary); color: var(--text-primary); overflow: hidden; scroll-margin-top: 80px; }
        .profile-maker-container { position: relative; z-index: 1; }
        .profile-maker-header { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: 2rem; margin-bottom: 2.4rem; }
        .profile-kicker { display: flex; align-items: center; gap: .6rem; font: 800 .78rem/1 var(--font-body); letter-spacing: 1.5px; color: var(--studio-accent-cyan); }
        .profile-kicker span { width: 28px; height: 3px; background: var(--primary-orange); }
        .profile-maker-title { max-width: 1040px; margin: 1rem 0 .8rem; font-size: clamp(3.6rem, 7.6vw, 7.8rem); letter-spacing: 1px; line-height: .84; transform: skewX(-7deg); text-wrap: balance; }
        .profile-maker-title::first-line { color: var(--primary-orange); }
        .profile-maker-subtitle { max-width: 780px; color: var(--text-secondary); font-size: 1rem; }
        .profile-local-stamp { padding: 1rem 1.15rem .85rem; border: 3px solid var(--primary-orange); color: var(--primary-orange); box-shadow: 6px 6px 0 var(--secondary-blue); font: 2rem/.8 var(--font-heading); letter-spacing: 1px; text-align: center; transform: rotate(4deg); }
        .profile-workbench { border: 3px solid var(--studio-text); background: var(--studio-surface); color: var(--studio-text); box-shadow: 12px 12px 0 var(--primary-orange); }
        .profile-workbench-bar, .profile-panel-heading, .profile-export-bar { display: flex; align-items: center; gap: .7rem; font: .82rem/1 var(--font-heading); letter-spacing: 1.6px; }
        .profile-workbench-bar { min-height: 48px; padding: .8rem 1.1rem; border-bottom: 2px solid var(--studio-border); background: var(--studio-surface-raised); }
        .profile-status-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--studio-accent-green); box-shadow: 0 0 0 4px color-mix(in srgb, var(--studio-accent-green) 18%, transparent); }
        .profile-workbench-meta { margin-left: auto; color: var(--studio-text-muted); }
        .profile-workbench-grid { display: grid; grid-template-columns: minmax(380px, .88fr) minmax(460px, 1.12fr); }
        .profile-control-panel, .profile-preview-panel { min-width: 0; padding: 1.25rem; }
        .profile-control-panel { border-right: 2px solid var(--studio-border); }
        .profile-panel-heading { justify-content: space-between; min-height: 28px; margin-bottom: .85rem; color: var(--studio-accent-orange); }
        .profile-heading-actions { display: flex; align-items: center; gap: .75rem; }
        .profile-reset-btn, .profile-center-btn { border: 0; background: none; color: var(--studio-text-muted); font: .72rem var(--font-heading); letter-spacing: 1.3px; cursor: pointer; }
        .profile-reset-btn:hover, .profile-center-btn:hover { color: var(--studio-accent-orange); }

        /* Multi-Photo Slot Bar */
        .profile-slots-bar { display: grid; gap: .75rem; }
        .profile-slots-list { display: flex; align-items: center; flex-wrap: wrap; gap: .65rem; }
        .profile-slot-item { position: relative; width: 58px; height: 58px; }
        .profile-slot-thumb-btn { position: relative; width: 100%; height: 100%; padding: 0; border-radius: 50%; border: 2px solid var(--studio-border); background: var(--studio-surface-soft); overflow: hidden; cursor: pointer; transition: transform .15s ease, border-color .15s ease; }
        .profile-slot-item.active .profile-slot-thumb-btn { border: 3px solid var(--primary-orange); box-shadow: 0 0 0 2px var(--secondary-blue); transform: scale(1.04); }
        .profile-slot-thumb-btn img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .profile-slot-index { position: absolute; bottom: 1px; left: 2px; min-width: 18px; height: 18px; padding: 0 4px; border-radius: 999px; background: var(--black); color: var(--white); font: .65rem/18px var(--font-heading); text-align: center; }
        .profile-slot-remove { position: absolute; top: -4px; right: -4px; width: 20px; height: 20px; border-radius: 50%; border: 1px solid var(--studio-text); background: var(--studio-surface); color: var(--studio-text); font: 700 .75rem/1 var(--font-body); cursor: pointer; display: grid; place-items: center; }
        .profile-slot-remove:hover { background: var(--studio-accent-danger); color: #FFF; }
        .profile-slot-add { width: 56px; height: 56px; border-radius: 50%; border: 2px dashed var(--studio-border); background: var(--studio-surface-raised); color: var(--studio-text); font: 1.5rem/1 var(--font-heading); cursor: pointer; display: grid; place-items: center; transition: border-color .15s ease, color .15s ease; }
        .profile-slot-add:hover { border-color: var(--studio-accent-cyan); color: var(--studio-accent-cyan); }

        .profile-upload-zone { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: .8rem; min-height: 70px; padding: .65rem .9rem; border: 2px dashed var(--studio-border); background: var(--studio-surface-raised); cursor: pointer; transition: border-color .2s ease; }
        .profile-upload-zone:hover, .profile-upload-zone:focus-visible { border-color: var(--studio-accent-cyan); outline: none; }
        .profile-upload-icon { display: grid; place-items: center; width: 38px; height: 38px; border: 2px solid var(--studio-text); color: var(--studio-accent-orange); font: 1.45rem/1 var(--font-heading); box-shadow: 3px 3px 0 var(--studio-accent-orange); }
        .profile-upload-zone strong, .profile-upload-zone small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .profile-upload-zone strong { font: .86rem var(--font-heading); letter-spacing: 1.1px; }
        .profile-upload-zone small { margin-top: .14rem; color: var(--studio-text-muted); font: .6rem var(--font-body); }
        .profile-upload-action { padding: .45rem .65rem; border: 2px solid var(--studio-text); font: .68rem var(--font-heading); letter-spacing: 1px; }

        /* Interactive Canvas Stage inside Left Panel */
        .profile-editor-stage-wrap { margin-top: 1rem; padding: 1rem; border: 1px solid var(--studio-border); background-image: linear-gradient(45deg, var(--studio-surface-soft) 25%, transparent 25%), linear-gradient(-45deg, var(--studio-surface-soft) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--studio-surface-soft) 75%), linear-gradient(-45deg, transparent 75%, var(--studio-surface-soft) 75%); background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0; display: grid; place-items: center; }
        .profile-canvas-wrap { width: min(100%, 300px); aspect-ratio: 1; border: 3px solid var(--studio-text); border-radius: 50%; overflow: hidden; box-shadow: 7px 7px 0 var(--studio-accent-orange); cursor: grab; touch-action: none; user-select: none; transition: border-radius .2s ease; }
        .profile-canvas-wrap.rounded-square { border-radius: 22%; }
        .profile-canvas-wrap.dragging { cursor: grabbing; }
        .profile-canvas-wrap canvas { display: block; width: 100%; height: 100%; }
        .profile-drag-hint { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: .6rem; margin-top: .8rem; color: var(--studio-text-muted); font: .62rem var(--font-heading); letter-spacing: .9px; }

        .profile-control-block { margin-top: 1.05rem; }
        .profile-section-divider { padding-top: 1rem; border-top: 1px solid var(--studio-border); }
        .profile-control-label, .profile-range-control > span { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: .45rem; color: var(--studio-text-muted); font: .7rem var(--font-heading); letter-spacing: 1.2px; }

        /* 5 Frame Selector Tabs */
        .profile-frame-tabs { display: grid; grid-template-columns: repeat(5, 1fr); gap: .35rem; padding: .3rem; background: var(--studio-surface-raised); border: 1px solid var(--studio-border); }
        .profile-frame-tab { display: flex; align-items: center; justify-content: center; gap: .3rem; min-height: 36px; border: 1px solid transparent; background: transparent; color: var(--studio-text-muted); font: .72rem var(--font-heading); letter-spacing: .9px; cursor: pointer; transition: all .15s ease; }
        .profile-frame-tab:hover { color: var(--studio-text); }
        .profile-frame-tab.active { background: var(--studio-surface); color: var(--studio-text); border-color: var(--primary-orange); box-shadow: 2px 2px 0 var(--primary-orange); }
        .profile-frame-tab-icon { font-size: .88rem; }

        .profile-text-input { width: 100%; height: 46px; border: 2px solid var(--studio-border); border-radius: 0; background: var(--studio-field); color: var(--studio-text); padding: 0 .85rem; outline: none; font: 1.08rem var(--font-heading); letter-spacing: 1.2px; text-transform: uppercase; }
        .profile-text-input:focus { border-color: var(--studio-accent-cyan); box-shadow: 4px 4px 0 var(--studio-accent-cyan); }
        .profile-preset-row { display: flex; flex-wrap: wrap; gap: .4rem; margin-top: .6rem; }
        .profile-preset-chip { display: flex; align-items: center; gap: .32rem; padding: .34rem .5rem; border: 1px solid var(--studio-border); background: var(--studio-surface-soft); color: var(--studio-text); font: .62rem var(--font-heading); letter-spacing: .7px; cursor: pointer; }
        .profile-preset-chip:hover, .profile-preset-chip.active { border-color: var(--primary-orange); background: var(--studio-surface-active); }
        .profile-preset-chip span { width: 8px; height: 8px; border-radius: 50%; border: 1px solid var(--studio-text); }

        .profile-color-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .6rem; margin-top: .95rem; }
        .profile-color-grid.three-cols { grid-template-columns: repeat(3, 1fr); }
        .profile-color-control { padding: .6rem; border: 1px solid var(--studio-border); color: var(--studio-text-muted); font: .64rem var(--font-heading); letter-spacing: 1px; }
        .profile-color-value { display: flex; align-items: center; gap: .45rem; margin-top: .35rem; color: var(--studio-text); }
        .profile-color-value input { width: 30px; height: 26px; padding: 0; border: 2px solid var(--studio-text); border-radius: 0; background: none; cursor: pointer; }
        .profile-color-value strong { font-size: .68rem; }

        .profile-range-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; margin-top: .9rem; }
        .profile-range-control > span { margin-bottom: .2rem; }
        .profile-range-control b, .profile-range-control em { font-weight: 400; font-style: normal; }
        .profile-range-control em { color: var(--studio-accent-cyan); }
        .profile-range-control input { width: 100%; accent-color: var(--studio-accent-orange); cursor: ew-resize; }

        /* Transform Action Buttons (Rotate & Mirror) */
        .profile-transform-actions { display: grid; grid-template-columns: repeat(4, 1fr); gap: .4rem; margin-top: .65rem; }
        .profile-action-chip { min-height: 34px; padding: .35rem .4rem; border: 1px solid var(--studio-border); background: var(--studio-surface-soft); color: var(--studio-text); font: .66rem var(--font-heading); letter-spacing: .8px; cursor: pointer; transition: all .15s ease; }
        .profile-action-chip:hover { border-color: var(--studio-accent-cyan); }
        .profile-action-chip.active { border-color: var(--primary-orange); background: var(--primary-orange); color: var(--black); box-shadow: 2px 2px 0 var(--secondary-blue); }

        /* Background Removal & Swatches */
        .profile-bg-top-row { display: flex; gap: .5rem; }
        .profile-remove-bg-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: .5rem; min-height: 40px; padding: .5rem .8rem; border: 2px solid var(--studio-border); background: var(--studio-surface-raised); color: var(--studio-text); font: .76rem var(--font-heading); letter-spacing: 1px; cursor: pointer; transition: all .18s ease; }
        .profile-remove-bg-btn:hover:not(:disabled) { border-color: var(--studio-accent-cyan); box-shadow: 3px 3px 0 var(--studio-accent-cyan); }
        .profile-remove-bg-btn.active { border-color: var(--studio-accent-green); background: color-mix(in srgb, var(--studio-accent-green) 14%, var(--studio-surface)); }
        .profile-remove-bg-btn:disabled { opacity: .65; cursor: wait; }
        .profile-ai-pill { font-style: normal; padding: .12rem .38rem; background: var(--secondary-blue); color: #FFF; font-size: .62rem; border-radius: 3px; }

        .profile-bg-swatches { display: flex; flex-wrap: wrap; align-items: center; gap: .42rem; margin-top: .75rem; }
        .profile-bg-swatch { width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--studio-border); cursor: pointer; transition: transform .15s ease, border-color .15s ease; }
        .profile-bg-swatch.checker { background-image: linear-gradient(45deg, #777 25%, transparent 25%), linear-gradient(-45deg, #777 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #777 75%), linear-gradient(-45deg, transparent 75%, #777 75%); background-size: 8px 8px; background-position: 0 0, 0 4px, 4px -4px, -4px 0; background-color: #333; }
        .profile-bg-swatch.active { transform: scale(1.16); border-color: var(--primary-orange); box-shadow: 0 0 0 2px var(--studio-text); }
        .profile-bg-custom-picker { position: relative; width: 28px; height: 28px; border-radius: 50%; border: 2px dashed var(--studio-text); display: grid; place-items: center; cursor: pointer; font-size: .72rem; overflow: hidden; }
        .profile-bg-custom-picker input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
        .profile-bg-privacy-hint { margin-top: .55rem; color: var(--studio-text-muted); font: .62rem/1.35 var(--font-body); }

        .profile-border-row { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: .65rem; }
        .profile-border-row input[type="range"] { width: 100%; accent-color: var(--studio-accent-orange); }
        .profile-border-row input[type="color"] { width: 34px; height: 28px; border: 2px solid var(--studio-text); background: none; padding: 0; cursor: pointer; }

        .profile-check-label { display: flex; align-items: center; gap: .4rem; color: var(--studio-text-muted); font: .64rem var(--font-heading); letter-spacing: .8px; cursor: pointer; }
        .profile-check-label input { width: 14px; height: 14px; accent-color: var(--studio-accent-orange); }

        /* Quality Checklist Card */
        .profile-quality-card { margin-top: 1.1rem; padding: .85rem 1rem; border: 1px solid var(--studio-border); background: var(--studio-surface-raised); }
        .profile-quality-title { color: var(--studio-accent-green); font: .76rem var(--font-heading); letter-spacing: 1px; margin-bottom: .45rem; }
        .profile-quality-card ul { list-style: none; display: grid; gap: .3rem; font: .66rem/1.35 var(--font-body); color: var(--studio-text-muted); }
        .profile-quality-card li { display: flex; align-items: center; gap: .45rem; }
        .profile-quality-card li span { color: var(--studio-accent-green); font-size: .6rem; }

        /* RIGHT PANEL: PREVIEW TABS, SOCIAL TARGET BAR & MOCKUPS */
        .profile-preview-panel { background: var(--studio-surface-raised); display: flex; flex-direction: column; gap: 1rem; }
        .profile-preview-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: .7rem; }
        .profile-view-tabs, .profile-theme-pills { display: flex; gap: .3rem; padding: .28rem; background: var(--studio-surface); border: 1px solid var(--studio-border); }
        .profile-view-tab, .profile-theme-pills button { padding: .42rem .75rem; border: 1px solid transparent; background: transparent; color: var(--studio-text-muted); font: .72rem var(--font-heading); letter-spacing: 1px; cursor: pointer; }
        .profile-view-tab.active, .profile-theme-pills button.active { background: var(--primary-orange); color: var(--black); border-color: var(--black); box-shadow: 2px 2px 0 var(--secondary-blue); }

        .profile-social-target-bar { padding: .8rem .95rem; border: 1px solid var(--studio-border); background: var(--studio-surface); }
        .profile-social-target-header { display: flex; justify-content: space-between; align-items: center; gap: .6rem; margin-bottom: .6rem; font: .68rem var(--font-heading); letter-spacing: 1.1px; color: var(--studio-text-muted); }
        .profile-export-all-inline { padding: .32rem .65rem; border: 1px solid var(--studio-accent-cyan); background: transparent; color: var(--studio-accent-cyan); font: .66rem var(--font-heading); letter-spacing: .9px; cursor: pointer; }
        .profile-export-all-inline:hover:not(:disabled) { background: var(--studio-accent-cyan); color: #000; }
        .profile-social-pills { display: flex; flex-wrap: wrap; gap: .4rem; }
        .profile-social-pill { display: inline-flex; align-items: center; gap: .38rem; padding: .34rem .55rem; border: 1px solid var(--studio-border); background: var(--studio-surface-soft); color: var(--studio-text); font: .66rem var(--font-heading); letter-spacing: .8px; cursor: pointer; transition: all .15s ease; }
        .profile-social-pill:hover { border-color: var(--studio-text); }
        .profile-social-pill.active { border-color: var(--primary-orange); background: var(--studio-surface-active); box-shadow: 2px 2px 0 var(--primary-orange); }
        .profile-social-badge { display: inline-grid; place-items: center; width: 18px; height: 18px; border-radius: 4px; color: #FFF; font: 700 .55rem/1 var(--font-body); }
        .profile-social-pill small { color: var(--studio-text-muted); font-size: .58rem; }

        /* All Apps Grid */
        .profile-apps-scroll { display: grid; gap: 1rem; max-height: 920px; overflow-y: auto; padding-right: .25rem; }
        .profile-social-card { border: 2px solid var(--studio-border); background: var(--studio-surface); overflow: hidden; }
        .profile-social-card-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: .6rem; padding: .65rem .95rem; border-bottom: 1px solid var(--studio-border); background: var(--studio-surface-soft); }
        .profile-social-card-title { display: flex; align-items: center; gap: .55rem; font: .82rem var(--font-heading); letter-spacing: 1px; }
        .profile-social-icon { display: inline-grid; place-items: center; width: 22px; height: 22px; border-radius: 5px; color: #FFF; font: 700 .62rem/1 var(--font-body); }
        .profile-social-spec { color: var(--studio-text-muted); font-size: .64rem; }
        .profile-social-export-btn { padding: .35rem .65rem; border: 1px solid var(--primary-orange); background: var(--primary-orange); color: var(--black); font: .66rem var(--font-heading); letter-spacing: .9px; cursor: pointer; }
        .profile-social-export-btn:hover { box-shadow: 2px 2px 0 var(--secondary-blue); }

        .profile-social-modes { display: grid; grid-template-columns: 1fr 1fr; }
        .profile-social-modes.single-mode { grid-template-columns: 1fr; }
        .profile-social-pane { padding: 1rem; display: grid; gap: .8rem; }
        .profile-social-pane.light { background: #FFFFFF; color: #111318; }
        .profile-social-pane.dark { background: #12151C; color: #F3F5F8; border-left: 1px solid #262B38; }
        .profile-mock-hero { display: flex; align-items: center; gap: .8rem; }
        .profile-mock-user strong { display: block; font: 700 .88rem/1.15 var(--font-body); }
        .profile-mock-user span { font: .72rem var(--font-body); opacity: .65; }

        .profile-avatar-shell { position: relative; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
        .profile-avatar-shell.rounded-square { border-radius: 22%; }
        .profile-avatar-shell.story-ring { padding: 3px; background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); }
        .profile-avatar-shell.story-ring img { border-radius: inherit; border: 2px solid #FFF; }
        .profile-avatar-shell img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .profile-avatar-shell.lg { width: 82px; height: 82px; }
        .profile-avatar-shell.md { width: 58px; height: 58px; }
        .profile-avatar-shell.sm { width: 38px; height: 38px; }
        .profile-avatar-shell.xs { width: 30px; height: 30px; }
        .profile-status-indicator { position: absolute; right: 2px; bottom: 2px; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #12151C; }

        .profile-mock-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .profile-mock-story { display: grid; justify-items: center; gap: .25rem; }
        .profile-mock-story small, .profile-mock-item small { display: block; margin-top: .22rem; font: 600 .56rem var(--font-heading); letter-spacing: 1px; opacity: .55; }
        .profile-mock-inline { display: flex; align-items: center; gap: .55rem; }
        .profile-mock-inline strong { display: block; font: 600 .74rem/1.15 var(--font-body); }
        .profile-mock-inline span { display: block; font: .65rem var(--font-body); opacity: .68; }
        .profile-mock-bubble { padding: .35rem .65rem; border-radius: 12px; background: rgba(128, 128, 128, 0.14); font: .7rem var(--font-body); }

        /* Compare Matrix */
        .profile-compare-wrap { display: grid; gap: 1rem; }
        .profile-compare-card { padding: 1rem; border: 2px solid var(--studio-border); overflow-x: auto; }
        .profile-compare-card.light { background: #FFFFFF; color: #111318; }
        .profile-compare-card.dark { background: #0B0D13; color: #F3F5F8; }
        .profile-compare-header, .profile-compare-row { display: grid; align-items: center; gap: .75rem; padding: .6rem 0; border-bottom: 1px solid rgba(128, 128, 128, 0.2); }
        .profile-compare-row:last-child { border-bottom: 0; }
        .profile-compare-mode-tag { font: .7rem var(--font-heading); letter-spacing: 1.2px; opacity: .7; }
        .profile-compare-col-head { display: flex; justify-content: center; }
        .profile-compare-choose-btn { padding: .35rem .75rem; border-radius: 999px; border: 1px solid rgba(128, 128, 128, 0.4); background: transparent; color: inherit; font: 600 .68rem var(--font-body); cursor: pointer; }
        .profile-compare-choose-btn.chosen { background: var(--primary-orange); color: #000; border-color: #000; font-weight: 700; }
        .profile-compare-px { font: .72rem var(--font-body); opacity: .65; }
        .profile-compare-cell { display: flex; justify-content: center; align-items: center; }
        .profile-compare-cell img { display: block; object-fit: cover; }

        /* On a Profile Mobile Phone Mockup */
        .profile-phone-stage { display: grid; place-items: center; padding: 1.2rem; border: 1px solid var(--studio-border); background: var(--studio-surface); }
        .profile-phone-mockup { width: min(100%, 370px); border-radius: 38px; border: 7px solid #1C1F26; overflow: hidden; box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45); }
        .profile-phone-mockup.light { background: #FFFFFF; color: #111318; }
        .profile-phone-mockup.dark { background: #10131A; color: #F3F5F8; }
        .profile-phone-statusbar { display: flex; justify-content: space-between; align-items: center; padding: .55rem 1.2rem; font: 700 .72rem var(--font-body); }
        .profile-phone-island { width: 88px; height: 20px; border-radius: 999px; background: #000; }
        .profile-phone-searchbar { display: grid; grid-template-columns: 28px 1fr auto; align-items: center; gap: .55rem; padding: .4rem 1rem .65rem; }
        .profile-phone-searchbar img { width: 28px; height: 28px; object-fit: cover; }
        .profile-phone-search-pill { padding: .32rem .7rem; border-radius: 999px; background: rgba(128, 128, 128, 0.14); font: .7rem var(--font-body); opacity: .8; }
        .profile-phone-banner { height: 76px; }
        .profile-phone-body { padding: 0 1.1rem 1.2rem; }
        .profile-phone-main-avatar { width: 96px; height: 96px; margin-top: -48px; border-radius: 50%; border: 4px solid currentColor; overflow: hidden; background: #000; }
        .profile-phone-main-avatar.rounded-square { border-radius: 22%; }
        .profile-phone-main-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .profile-phone-identity { margin-top: .55rem; }
        .profile-phone-identity h4 { font: 700 1.1rem var(--font-body); text-transform: none; }
        .profile-phone-identity p { margin-top: .2rem; font: .74rem/1.35 var(--font-body); opacity: .86; }
        .profile-phone-identity small { display: block; margin-top: .25rem; font: .66rem var(--font-body); opacity: .6; }
        .profile-phone-cta-row { display: flex; gap: .5rem; margin-top: .75rem; }
        .profile-phone-cta-primary, .profile-phone-cta-secondary { padding: .38rem .9rem; border-radius: 999px; font: 600 .72rem var(--font-body); cursor: pointer; }
        .profile-phone-cta-primary { border: 0; color: #FFF; }
        .profile-phone-cta-secondary { border: 1px solid rgba(128, 128, 128, 0.45); background: transparent; color: inherit; }
        .profile-phone-feed-section { margin-top: 1rem; padding-top: .8rem; border-top: 1px solid rgba(128, 128, 128, 0.2); display: grid; gap: .65rem; }
        .profile-phone-feed-label { font: .62rem var(--font-heading); letter-spacing: 1px; opacity: .6; }
        .profile-phone-post, .profile-phone-comment { display: flex; align-items: flex-start; gap: .6rem; }
        .profile-phone-post img.sz-48 { width: 48px; height: 48px; object-fit: cover; flex-shrink: 0; }
        .profile-phone-comment img.sz-32 { width: 32px; height: 32px; object-fit: cover; flex-shrink: 0; }
        .profile-phone-post strong, .profile-phone-comment strong { display: block; font: 600 .74rem var(--font-body); }
        .profile-phone-post span, .profile-phone-comment span { display: block; font: .66rem var(--font-body); opacity: .75; }
        .profile-phone-skeleton-lines { display: grid; gap: .3rem; margin-top: .45rem; }
        .profile-phone-skeleton-lines span { height: 7px; border-radius: 4px; background: rgba(128, 128, 128, 0.2); display: block; width: 190px; }
        .profile-phone-skeleton-lines span:last-child { width: 130px; }
        .profile-phone-comment-box { padding: .45rem .65rem; border-radius: 10px; background: rgba(128, 128, 128, 0.12); flex: 1; }

        .profile-preview-note { display: flex; align-items: center; gap: .5rem; max-width: 540px; margin-top: 1rem; color: var(--studio-text-muted); font: .64rem var(--font-body); letter-spacing: .2px; }
        .profile-preview-note span { color: var(--studio-accent-cyan); font-size: 1rem; }

        /* Bottom Export Bar */
        .profile-export-bar { min-height: 76px; padding: 1rem 1.3rem; border-top: 2px solid var(--studio-border); flex-wrap: wrap; }
        .profile-notice { color: var(--studio-accent-cyan); }
        .profile-privacy-note { display: flex; gap: .4rem; margin-left: auto; color: var(--studio-text-muted); font-size: .68rem; }
        .profile-privacy-note span { color: var(--studio-accent-green); }
        .profile-export-buttons { display: flex; align-items: center; gap: .65rem; flex-wrap: wrap; }
        .profile-download-pack-btn { min-height: 46px; padding: .65rem .95rem; border: 2px solid var(--studio-accent-cyan); background: transparent; color: var(--studio-accent-cyan); font: .9rem var(--font-heading); letter-spacing: 1.1px; cursor: pointer; transition: all .18s ease; }
        .profile-download-pack-btn:hover:not(:disabled) { background: var(--studio-accent-cyan); color: #000; }
        .profile-download-btn { display: flex; align-items: center; gap: .8rem; min-height: 46px; padding: .65rem 1rem; border: 2px solid var(--black); background: var(--primary-orange); color: var(--black); box-shadow: 4px 4px 0 var(--secondary-blue); font: .96rem var(--font-heading); letter-spacing: 1.2px; cursor: pointer; transition: transform .18s ease, box-shadow .18s ease; }
        .profile-download-btn:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 var(--secondary-blue); }
        .profile-download-btn span { font-size: 1.2rem; }

        .profile-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 2.8rem; }
        .profile-steps span { display: flex; align-items: center; gap: .8rem; padding: .8rem 1rem; border-top: 2px solid var(--border-color); color: var(--text-secondary); font: .72rem var(--font-heading); letter-spacing: 1px; }
        .profile-steps b { color: var(--primary-orange); font-size: 1.25rem; }
        .profile-disclaimer { margin-top: 1.2rem; color: var(--text-secondary); font-size: .68rem; opacity: .7; }

        @media (max-width: 1080px) {
          .profile-workbench-grid { grid-template-columns: 1fr; }
          .profile-control-panel { border-right: 0; border-bottom: 2px solid var(--studio-border); }
          .profile-export-bar { align-items: flex-start; }
          .profile-privacy-note { margin-left: 0; }
        }
        @media (max-width: 680px) {
          .profile-maker-section { padding-top: 6.5rem; }
          .profile-maker-header { grid-template-columns: 1fr; align-items: start; }
          .profile-local-stamp { display: none; }
          .profile-maker-title { font-size: clamp(3.2rem, 15vw, 5rem); }
          .profile-workbench { box-shadow: 7px 7px 0 var(--primary-orange); }
          .profile-workbench-meta { display: none; }
          .profile-control-panel, .profile-preview-panel { padding: .9rem; }
          .profile-frame-tabs { grid-template-columns: repeat(3, 1fr); }
          .profile-transform-actions { grid-template-columns: repeat(2, 1fr); }
          .profile-color-grid, .profile-color-grid.three-cols, .profile-range-grid { grid-template-columns: 1fr; }
          .profile-social-modes { grid-template-columns: 1fr; }
          .profile-social-pane.dark { border-left: 0; border-top: 1px solid #262B38; }
          .profile-export-buttons { width: 100%; flex-direction: column; align-items: stretch; }
          .profile-download-btn, .profile-download-pack-btn { justify-content: center; width: 100%; }
          .profile-steps { grid-template-columns: 1fr; gap: .2rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .profile-upload-zone, .profile-download-btn, .profile-slot-thumb-btn { transition: none; }
        }
      `}</style>
    </section>
  );
};

export default LinkedInProfileMaker;
