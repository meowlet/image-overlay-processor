import sharp from "sharp";
import path from "path";
import type { ProcessingConfig } from "../types/index.js";
import { FileSystemService } from "../utils/fileSystem.js";
import { ImageUtils } from "../utils/imageUtils.js";
import { OverlayService } from "./overlayService.js";

export class ImageProcessor {
  private config: ProcessingConfig;
  private overlayService: OverlayService;

  constructor(config: ProcessingConfig) {
    this.config = config;
    this.overlayService = new OverlayService(config);
  }

  async processImages(): Promise<void> {
    try {
      await this.validatePaths();
      await FileSystemService.ensureDirectory(this.config.outputDir);

      const imageFiles = await FileSystemService.getImageFiles(
        this.config.inputDir
      );

      if (imageFiles.length === 0) {
        console.log("No image files found in input directory.");
        return;
      }

      console.log(`Starting to process ${imageFiles.length} image files...`);

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        if (file) {
          try {
            await this.processImage(file);
            console.log(`[${i + 1}/${imageFiles.length}] Processed: ${file}`);
          } catch (error) {
            console.error(`Error processing ${file}:`, error);
          }
        }
      }

      console.log("Image processing completed successfully!");
    } catch (error) {
      console.error("Error during image processing:", error);
    }
  }

  private async validatePaths(): Promise<void> {
    const pathsToValidate = [
      this.config.inputDir,
      this.config.horizontalOverlayPath,
      this.config.verticalOverlayPath,
    ];

    await FileSystemService.validatePaths(pathsToValidate);
  }

  private async processImage(filename: string): Promise<void> {
    const inputPath = path.join(this.config.inputDir, filename);
    const outputPath = path.join(this.config.outputDir, filename);

    const originalImage = sharp(inputPath);
    const originalMetadata = await originalImage.metadata();

    const rotatedImage = sharp(inputPath).rotate();

    const { width: finalWidth, height: finalHeight } =
      ImageUtils.getFinalDimensions({
        width: originalMetadata.width!,
        height: originalMetadata.height!,
        orientation: originalMetadata.orientation,
      });

    console.log(
      `${filename} - Original: ${originalMetadata.width}x${
        originalMetadata.height
      }, EXIF: ${originalMetadata.orientation || "none"}`
    );
    console.log(
      `${filename} - After auto-rotation: ${finalWidth}x${finalHeight}`
    );

    const orientation = ImageUtils.detectOrientation(finalWidth, finalHeight);
    const overlayInfo = await this.overlayService.getOverlayInfo(orientation);

    const imageDimensions = ImageUtils.calculateImageDimensions(
      finalWidth,
      finalHeight,
      overlayInfo.width,
      overlayInfo.height,
      overlayInfo.widthPercent
    );

    console.log(
      `Processing ${filename} as ${orientation} image (${finalWidth}x${finalHeight})`
    );

    const resizedImageBuffer = await rotatedImage
      .resize(imageDimensions.width, imageDimensions.height, {
        fit: "fill",
      })
      .png()
      .toBuffer();

    const canvas = sharp({
      create: {
        width: overlayInfo.width,
        height: overlayInfo.height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      },
    });

    await canvas
      .composite([
        {
          input: resizedImageBuffer,
          left: imageDimensions.x,
          top: imageDimensions.y,
        },
        {
          input: overlayInfo.path,
          left: 0,
          top: 0,
        },
      ])
      .png()
      .toFile(outputPath);
  }
}
