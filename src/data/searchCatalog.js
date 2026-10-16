import { CONVERTER_TOOLS } from '../utils/converterEngine';
import { STUDIO_MODES } from '../components/StudioModelSelector';

const feature = (id, title, type, tag, anchor, description, keywords = [], targetId = null) => ({
  id,
  title,
  type,
  tag,
  anchor,
  description,
  keywords,
  targetId,
  kind: 'TOOL'
});

const converterEntries = CONVERTER_TOOLS.map((tool) => feature(
  `converter-${tool.id}`,
  tool.name,
  'CONVERTER',
  `${tool.inputFormat} → ${tool.outputFormat}`,
  '#converter-tools',
  tool.desc,
  [tool.inputFormat, tool.outputFormat, tool.outputExt, 'image converter', 'format converter', 'transcode', tool.id.replaceAll('-', ' ')],
  tool.id
));

const aiModeEntries = STUDIO_MODES.map((mode) => feature(
  `ai-mode-${mode.id}`,
  mode.title,
  mode.id === 'history' ? 'LIBRARY' : 'AI LAB',
  mode.subtitle,
  '#studio-lab',
  mode.desc,
  [mode.id.replaceAll('_', ' '), ...(mode.recipes || []), 'creative suite']
));

export const TOOL_SEARCH_DATA = [
  feature('tool-ai-labs', 'AI Labs & Vectorine', 'TOOL SUITE', 'AI LABS', '#studio-lab', 'Generate, edit, upscale, vectorize, compare, save, and download creative assets.', ['ai image', 'image generator', 'image editor', 'vectorine', 'runpod', 'cloudflare workers ai']),
  ...aiModeEntries,
  feature('ai-generate', 'AI Image Generation', 'AI FEATURE', 'AI LABS', '#studio-lab', 'Create original images from a text prompt with studio recipe prompts.', ['text to image', 'prompt', 'flux', 'sdxl', 'generate artwork', 'creative ai']),
  feature('ai-edit', 'AI Image Editing & Restyling', 'AI FEATURE', 'AI LABS', '#studio-lab', 'Upload a reference image, describe the change, and produce a new visual direction.', ['image to image', 'restyle', 'edit photo', 'reference image', 'add object', 'remove object']),
  feature('ai-upscale', '4K AI Image Upscaler', 'AI FEATURE', 'AI LABS', '#studio-lab', 'Recover detail and enlarge images with Pruna AI or Real-ESRGAN super-resolution.', ['upscale photo', 'enlarge image', 'super resolution', 'enhance image', 'real esrgan', 'pruna']),
  feature('ai-vector', 'Raster Logo to SVG Vectorine', 'AI FEATURE', 'AI LABS', '#studio-lab', 'Trace logos and graphics into scalable color or monochrome SVG paths.', ['logo vectorizer', 'vector trace', 'png to vector', 'jpg to vector', 'bezier', 'svg code']),
  feature('ai-compare', 'AI Before & After Comparison', 'AI FEATURE', 'AI LABS', '#studio-lab', 'Inspect generated, upscaled, or vectorized output against its source.', ['comparison slider', 'preview', 'source output']),
  feature('ai-history', 'Saved AI Asset Library', 'AI FEATURE', 'AI LABS', '#studio-lab', 'Re-download or reload saved generations, prompts, vectors, and high-resolution assets.', ['render history', 'saved images', 'downloads', 'prompt history']),

  feature('tool-converters', 'Image & Vector Converter Matrix', 'TOOL SUITE', 'CONVERTERS', '#converter-tools', 'Convert SVG, PNG, JPG, WebP, AVIF, GIF, APNG, JXL, SVGZ, and ICO formats.', ['image conversion', 'vector conversion', 'raster', 'transcoder']),
  ...converterEntries,
  feature('converter-resolution', '1x, 2x & 4K Converter Export', 'CONVERTER FEATURE', 'CONVERTERS', '#converter-tools', 'Render vector artwork at standard, retina, or ultra 4K resolution.', ['resolution upscale', 'retina', '4x export', 'high resolution']),
  feature('converter-transparency', 'Transparent Background Export', 'CONVERTER FEATURE', 'CONVERTERS', '#converter-tools', 'Preserve alpha or preview artwork on checker, white, or black backgrounds.', ['alpha channel', 'transparent png', 'background color', 'checkerboard']),
  feature('converter-quality', 'Conversion Quality Control', 'CONVERTER FEATURE', 'CONVERTERS', '#converter-tools', 'Tune compression quality for JPG, WebP, AVIF, and other raster output.', ['quality slider', 'file size', 'compression']),
  feature('converter-vector-presets', 'SVG Vector Trace Presets', 'CONVERTER FEATURE', 'CONVERTERS', '#converter-tools', 'Choose flat, detailed, poster, line-art, or black-and-white vector tracing.', ['flat vector', 'detailed vector', 'posterize', 'line art', 'black white', 'color palette']),
  feature('converter-preview', 'Converter Before & After Preview', 'CONVERTER FEATURE', 'CONVERTERS', '#converter-tools', 'Compare source and output with a dual slider or side-by-side view.', ['compare image', 'dual slider', 'side by side', 'preview']),
  feature('converter-svg-code', 'Copy SVG Markup', 'CONVERTER FEATURE', 'CONVERTERS', '#converter-tools', 'Copy generated SVG XML directly from a raster-to-vector conversion.', ['svg xml', 'source code', 'clipboard']),

  feature('tool-optimizer', 'Image Compressor & Optimizer', 'TOOL SUITE', 'OPTIMIZER', '#image-compressor', 'Batch-compress raster and vector images locally with detailed quality controls.', ['tinypng', 'imageoptim', 'shrink image', 'reduce file size', 'optimize image']),
  feature('optimizer-lossless', 'Lossless Image Compression', 'OPTIMIZATION', 'OPTIMIZER', '#image-compressor', 'Reduce file size while preserving every visible pixel.', ['lossless', 'compress png', 'compress svg', 'compress gif']),
  feature('optimizer-lossy', 'Lossy Image Compression', 'OPTIMIZATION', 'OPTIMIZER', '#image-compressor', 'Trade a controlled amount of detail for substantially smaller files.', ['lossy', 'quality', 'small image', 'web performance']),
  feature('optimizer-batch', 'Batch Image Optimization', 'OPTIMIZATION', 'OPTIMIZER', '#image-compressor', 'Queue multiple files, optimize them together, and export a ZIP archive.', ['bulk compress', 'multiple images', 'zip download', 'batch queue']),
  feature('optimizer-metadata', 'EXIF & Metadata Scrubber', 'OPTIMIZATION', 'OPTIMIZER', '#image-compressor', 'Remove private EXIF data, thumbnails, comments, and unnecessary profiles.', ['remove exif', 'strip metadata', 'privacy', 'icc profile', 'camera data']),
  feature('optimizer-webp', 'Convert & Compress to WebP', 'OPTIMIZATION', 'OPTIMIZER', '#image-compressor', 'Transcode uploads to compact WebP while optimizing visual quality.', ['jpg to webp', 'png to webp', 'web format', 'website image']),
  feature('optimizer-avif', 'Convert & Compress to AVIF', 'OPTIMIZATION', 'OPTIMIZER', '#image-compressor', 'Export next-generation AVIF images with a configurable quality target.', ['jpg to avif', 'png to avif', 'modern image format']),
  feature('optimizer-jpeg', 'MozJPEG Optimization', 'OPTIMIZATION', 'OPTIMIZER', '#image-compressor', 'Use trellis quantization, optimized Huffman tables, progressive scans, and deringing.', ['compress jpg', 'compress jpeg', 'trellis', 'huffman', 'progressive jpeg', 'deringing']),
  feature('optimizer-png', 'PNG Quantization & Dithering', 'OPTIMIZATION', 'OPTIMIZER', '#image-compressor', 'Control PNG palette size, quality, quantization, and dithering.', ['pngquant', 'png colors', 'palette reduction', 'dither', 'compress png']),
  feature('optimizer-svg', 'SVG Minify & Optimize', 'OPTIMIZATION', 'OPTIMIZER', '#image-compressor', 'Strip redundant vector markup and tune decimal precision with SVGO-style cleanup.', ['svgo', 'minify svg', 'svg precision', 'vector compression']),
  feature('optimizer-gif', 'GIF Compression', 'OPTIMIZATION', 'OPTIMIZER', '#image-compressor', 'Preserve animation while reducing palette depth and encoded size.', ['optimize gif', 'compress animation', 'gif quality', 'palette']),
  feature('optimizer-resize', 'Resize While Optimizing', 'OPTIMIZATION', 'OPTIMIZER', '#image-compressor', 'Cap the longest image dimension at 1920, 1280, or 800 pixels.', ['resize image', 'image dimensions', 'max width', 'responsive images']),
  feature('optimizer-preview', 'Optimization Before & After Inspector', 'OPTIMIZATION', 'OPTIMIZER', '#image-compressor', 'Zoom in and compare original and compressed output before downloading.', ['visual compare', 'zoom', 'quality preview', 'file savings']),

  feature('tool-gif', 'Animated GIF Maker', 'TOOL SUITE', 'GIF MAKER', '#gif-maker', 'Build, preview, optimize, and export animated GIFs from images or archives.', ['gif creator', 'make animation', 'photos to gif', 'animated image']),
  feature('gif-import', 'Images & Archives to GIF', 'GIF FEATURE', 'GIF MAKER', '#gif-maker', 'Import images, SVG, animation formats, ZIP, 7z, TAR, or RAR frame bundles.', ['zip to gif', 'images to gif', 'png to gif', 'jpg to gif', 'webp to gif']),
  feature('gif-timeline', 'GIF Frame Timeline', 'GIF FEATURE', 'GIF MAKER', '#gif-maker', 'Reorder, duplicate, delete, reverse, and scrub animation frames.', ['frame editor', 'reverse gif', 'duplicate frame', 'timeline', 'scrubber']),
  feature('gif-speed', 'GIF Speed & Frame Delay', 'GIF FEATURE', 'GIF MAKER', '#gif-maker', 'Set global FPS or precise delay values for individual frames.', ['speed up gif', 'slow down gif', 'fps', 'milliseconds', 'frame timing']),
  feature('gif-size', 'GIF Canvas & Social Size Presets', 'GIF FEATURE', 'GIF MAKER', '#gif-maker', 'Export avatars, emojis, profile images, feeds, HD video, or reels at preset sizes.', ['discord emoji', 'slack emoji', 'avatar gif', 'instagram gif', 'reel size', 'custom size']),
  feature('gif-fit', 'GIF Frame Fit & Background', 'GIF FEATURE', 'GIF MAKER', '#gif-maker', 'Contain, cover, or stretch frames over transparent, black, white, or orange canvas.', ['crop gif', 'fit canvas', 'transparent gif', 'background color']),
  feature('gif-transitions', 'GIF Transitions & Tween Frames', 'GIF FEATURE', 'GIF MAKER', '#gif-maker', 'Add cross-fades, slides, dip-to-black, zoom pulses, and bar wipes.', ['crossfade gif', 'slide transition', 'tween', 'smooth animation', 'wipe']),
  feature('gif-loop', 'Infinite & Ping-Pong GIF Loops', 'GIF FEATURE', 'GIF MAKER', '#gif-maker', 'Repeat forever or play forward and backward in a seamless loop.', ['boomerang gif', 'loop gif', 'reverse loop', 'infinite animation']),
  feature('gif-optimize', 'GIF Palette Squeeze', 'GIF FEATURE', 'GIF MAKER', '#gif-maker', 'Re-encode with fewer colors or one shared palette to cut animation size.', ['compress gif', 'optimize gif', 'shared color table', 'reduce gif size']),
  feature('gif-preview', 'Live GIF Player & Scrubber', 'GIF FEATURE', 'GIF MAKER', '#gif-maker', 'Preview timing, transitions, and tween frames before final encoding.', ['play animation', 'pause gif', 'preview frames']),

  feature('tool-json', 'JSON to CSV Transformer', 'TOOL SUITE', 'JSON LAB', '#json-lab', 'Validate structured JSON and turn objects or arrays into spreadsheet-ready CSV.', ['json converter', 'json to csv', 'data transformer', 'spreadsheet export']),
  feature('json-validate', 'JSON Validation', 'JSON FEATURE', 'JSON LAB', '#json-lab', 'Catch malformed JSON and explain where parsing failed.', ['json checker', 'json validator', 'invalid json', 'parse json']),
  feature('json-flatten', 'Flatten Nested JSON', 'JSON FEATURE', 'JSON LAB', '#json-lab', 'Convert nested objects into dot-notated CSV columns.', ['nested json', 'dot notation', 'flatten object', 'normalize json']),
  feature('json-array', 'JSON Array to Table', 'JSON FEATURE', 'JSON LAB', '#json-lab', 'Preview object arrays as rows and unified keys as table columns.', ['json viewer', 'table preview', 'array rows', 'data grid']),
  feature('json-separator', 'Custom CSV Separators', 'JSON FEATURE', 'JSON LAB', '#json-lab', 'Export comma-, semicolon-, tab-, or pipe-delimited data.', ['delimiter', 'tsv', 'pipe separated', 'semicolon csv']),
  feature('json-copy', 'Copy CSV to Clipboard', 'JSON FEATURE', 'JSON LAB', '#json-lab', 'Copy transformed CSV instantly without creating a file.', ['clipboard', 'copy data', 'csv output']),
  feature('json-download', 'Download CSV', 'JSON FEATURE', 'JSON LAB', '#json-lab', 'Download spreadsheet-safe UTF-8 CSV with escaped values.', ['export csv', 'save csv', 'spreadsheet']),
  feature('json-local', 'Private Browser-Only JSON Tool', 'JSON FEATURE', 'JSON LAB', '#json-lab', 'Transform data locally without uploading it to a server.', ['private json', 'local processing', 'offline tool', 'secure data'])
];

export const POPULAR_SEARCH_PILLS = [
  { label: 'COMPRESS IMAGE', query: 'compress image' },
  { label: 'FAVICON / ICO', query: 'favicon' },
  { label: 'WEBP', query: 'webp' },
  { label: 'GIF MAKER', query: 'gif maker' },
  { label: 'SVG → PNG', query: 'svg to png' },
  { label: '4K UPSCALE', query: '4k upscale' },
  { label: 'JSON → CSV', query: 'json to csv' }
];
