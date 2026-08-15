import Replicate from 'replicate';

/**
 * Replicate Service Helper for Rynell AI Studio
 * Uses the official 'replicate' SDK package.
 */

export const getReplicateClient = (apiToken) => {
  const token = apiToken || import.meta.env.VITE_REPLICATE_API_TOKEN;
  if (!token) {
    console.warn("Replicate API Token is missing.");
    return null;
  }

  return new Replicate({
    auth: token,
  });
};

/**
 * Runs Real-ESRGAN image upscaling prediction
 * Model: xinntao/realesrgan
 * Version: 1b976a4d456ed9e4d1a846597b7614e79eadad3032e9124fa63859db0fd59b56
 */
export const runRealESRGAN = async (imgUrl, options = {}, apiToken) => {
  const replicate = getReplicateClient(apiToken);
  if (!replicate) {
    throw new Error("Replicate client not initialized. Missing API token.");
  }

  const modelVersion = 'xinntao/realesrgan:1b976a4d456ed9e4d1a846597b7614e79eadad3032e9124fa63859db0fd59b56';

  const input = {
    img: imgUrl,
    version: options.version || 'General - RealESRGANplus',
    scale: options.scale || 4,
    face_enhance: options.faceEnhance !== undefined ? options.faceEnhance : true,
    tile: options.tile || 0
  };

  try {
    const output = await replicate.run(modelVersion, { input });
    return output;
  } catch (error) {
    console.error("Replicate prediction error:", error);
    throw error;
  }
};
