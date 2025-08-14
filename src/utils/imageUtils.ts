import {
  ImageOrientation,
  type ImageDimensions,
  type ImageMetadata,
} from "../types/index.js";

export class ImageUtils {
  static detectOrientation(width: number, height: number): ImageOrientation {
    return width > height
      ? ImageOrientation.HORIZONTAL
      : ImageOrientation.VERTICAL;
  }

  static calculateImageDimensions(
    originalWidth: number,
    originalHeight: number,
    canvasWidth: number,
    canvasHeight: number,
    widthPercent: number
  ): ImageDimensions {
    const targetWidth = Math.round(canvasWidth * (widthPercent / 100));
    const aspectRatio = originalHeight / originalWidth;
    const targetHeight = Math.round(targetWidth * aspectRatio);

    const x = Math.round((canvasWidth - targetWidth) / 2);
    const y = Math.round((canvasHeight - targetHeight) / 2);

    return { width: targetWidth, height: targetHeight, x, y };
  }

  static getFinalDimensions(metadata: ImageMetadata): {
    width: number;
    height: number;
  } {
    let finalWidth = metadata.width;
    let finalHeight = metadata.height;

    // Handle EXIF orientation for rotated images
    if (
      metadata.orientation &&
      metadata.orientation >= 5 &&
      metadata.orientation <= 8
    ) {
      finalWidth = metadata.height;
      finalHeight = metadata.width;
    }

    return { width: finalWidth, height: finalHeight };
  }
}
