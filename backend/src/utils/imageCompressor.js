/**
 * Image Compressor Utility
 * Optimizes images for OCR and storage
 * Target: <500KB file size
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const TARGET_SIZE_KB = 500;
const MAX_DIMENSION = 1920;
const MIN_QUALITY = 20;

/**
 * Compress image to target size
 * @param {string} inputPath - Path to input image
 * @param {string} outputPath - Path for output image
 * @returns {Promise<Object>} - {path, size, width, height}
 */
async function compressImage(inputPath, outputPath) {
  try {
    let quality = 90;
    let buffer;
    let metadata;

    // Get original metadata
    const original = await sharp(inputPath).metadata();
    metadata = original;

    // Resize if too large
    let pipeline = sharp(inputPath);
    
    if (original.width > MAX_DIMENSION || original.height > MAX_DIMENSION) {
      pipeline = pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Try progressively lower quality until size is acceptable
    while (quality >= MIN_QUALITY) {
      buffer = await pipeline
        .jpeg({ quality, progressive: true })
        .toBuffer();

      const sizeKB = buffer.length / 1024;
      
      if (sizeKB <= TARGET_SIZE_KB) {
        break;
      }

      quality -= 10;
    }

    // Write compressed image
    await fs.writeFile(outputPath, buffer);

    // Get final metadata
    const final = await sharp(outputPath).metadata();

    return {
      path: outputPath,
      size: buffer.length,
      width: final.width,
      height: final.height,
      quality: quality
    };
  } catch (error) {
    console.error('[ImageCompressor] Error:', error.message);
    throw error;
  }
}

/**
 * Preprocess image for OCR (greyscale, sharpen, normalize)
 * @param {string} inputPath - Path to input image
 * @param {string} outputPath - Path for output image
 * @returns {Promise<Object>} - Processing result
 */
async function preprocessForOCR(inputPath, outputPath) {
  try {
    const pipeline = sharp(inputPath)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .greyscale()
      .normalize()
      .sharpen({ sigma: 1, flat: 1, jagged: 2 })
      .jpeg({ quality: 85 });

    await pipeline.toFile(outputPath);

    const stats = await fs.stat(outputPath);

    return {
      path: outputPath,
      size: stats.size
    };
  } catch (error) {
    console.error('[ImageCompressor] OCR preprocess error:', error.message);
    throw error;
  }
}

/**
 * Get image info
 * @param {string} imagePath - Path to image
 * @returns {Promise<Object>} - Image metadata
 */
async function getImageInfo(imagePath) {
  try {
    const metadata = await sharp(imagePath).metadata();
    const stats = await fs.stat(imagePath);

    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: stats.size
    };
  } catch (error) {
    console.error('[ImageCompressor] Get info error:', error.message);
    throw error;
  }
}

module.exports = {
  compressImage,
  preprocessForOCR,
  getImageInfo,
  TARGET_SIZE_KB,
  MAX_DIMENSION
};
