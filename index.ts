import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

interface ProcessingConfig {
  inputDir: string;
  horizontalOverlayPath: string;
  verticalOverlayPath: string;
  outputDir: string;
  horizontalWidthPercent: number;
  verticalWidthPercent: number;
}

enum ImageOrientation {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical",
}

interface OverlayInfo {
  path: string;
  width: number;
  height: number;
  widthPercent: number;
}

class ImageProcessor {
  private config: ProcessingConfig;

  constructor(config: ProcessingConfig) {
    this.config = config;
  }

  async processImages(): Promise<void> {
    try {
      await this.validatePaths();

      await this.ensureOutputDirectory();

      const imageFiles = await this.getImageFiles();

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
    try {
      await fs.access(this.config.inputDir);
    } catch {
      throw new Error(
        `Input directory does not exist: ${this.config.inputDir}`
      );
    }

    try {
      await fs.access(this.config.horizontalOverlayPath);
    } catch {
      throw new Error(
        `Horizontal overlay file does not exist: ${this.config.horizontalOverlayPath}`
      );
    }

    try {
      await fs.access(this.config.verticalOverlayPath);
    } catch {
      throw new Error(
        `Vertical overlay file does not exist: ${this.config.verticalOverlayPath}`
      );
    }
  }

  private async ensureOutputDirectory(): Promise<void> {
    try {
      await fs.access(this.config.outputDir);
    } catch {
      await fs.mkdir(this.config.outputDir, { recursive: true });
      console.log(`Created output directory: ${this.config.outputDir}`);
    }
  }

  private async getImageFiles(): Promise<string[]> {
    const files = await fs.readdir(this.config.inputDir);
    const imageExtensions = [".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"];

    return files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });
  }

  private detectOrientation(width: number, height: number): ImageOrientation {
    return width > height
      ? ImageOrientation.HORIZONTAL
      : ImageOrientation.VERTICAL;
  }

  private async getOverlayInfo(
    orientation: ImageOrientation
  ): Promise<OverlayInfo> {
    const overlayPath =
      orientation === ImageOrientation.HORIZONTAL
        ? this.config.horizontalOverlayPath
        : this.config.verticalOverlayPath;

    const widthPercent =
      orientation === ImageOrientation.HORIZONTAL
        ? this.config.horizontalWidthPercent
        : this.config.verticalWidthPercent;

    const overlayImage = sharp(overlayPath);
    const overlayMetadata = await overlayImage.metadata();

    if (!overlayMetadata.width || !overlayMetadata.height) {
      throw new Error(
        `Unable to read overlay image dimensions: ${overlayPath}`
      );
    }

    return {
      path: overlayPath,
      width: overlayMetadata.width,
      height: overlayMetadata.height,
      widthPercent,
    };
  }

  private calculateImageDimensions(
    originalWidth: number,
    originalHeight: number,
    canvasWidth: number,
    canvasHeight: number,
    widthPercent: number
  ): { width: number; height: number; x: number; y: number } {
    const targetWidth = Math.round(canvasWidth * (widthPercent / 100));
    const aspectRatio = originalHeight / originalWidth;
    const targetHeight = Math.round(targetWidth * aspectRatio);

    const x = Math.round((canvasWidth - targetWidth) / 2);
    const y = Math.round((canvasHeight - targetHeight) / 2);

    return { width: targetWidth, height: targetHeight, x, y };
  }

  private async processImage(filename: string): Promise<void> {
    const inputPath = path.join(this.config.inputDir, filename);
    const outputPath = path.join(this.config.outputDir, filename);

    const originalImage = sharp(inputPath);
    const originalMetadata = await originalImage.metadata();

    const rotatedImage = sharp(inputPath).rotate();

    let finalWidth = originalMetadata.width!;
    let finalHeight = originalMetadata.height!;

    if (
      originalMetadata.orientation &&
      originalMetadata.orientation >= 5 &&
      originalMetadata.orientation <= 8
    ) {
      finalWidth = originalMetadata.height!;
      finalHeight = originalMetadata.width!;
    }

    console.log(
      `${filename} - Original: ${originalMetadata.width}x${
        originalMetadata.height
      }, EXIF: ${originalMetadata.orientation || "none"}`
    );
    console.log(
      `${filename} - After auto-rotation: ${finalWidth}x${finalHeight}`
    );

    const orientation = this.detectOrientation(finalWidth, finalHeight);

    const overlayInfo = await this.getOverlayInfo(orientation);

    const imageDimensions = this.calculateImageDimensions(
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

const defaultConfig: ProcessingConfig = {
  inputDir: "./input",
  horizontalOverlayPath: "./overlay-horizontal.png",
  verticalOverlayPath: "./overlay-vertical.png",
  outputDir: "./output",
  horizontalWidthPercent: 82,
  verticalWidthPercent: 79,
};

async function main() {
  console.log("Image Overlay Processor (Optimized)");
  console.log("=========================================");

  const config = getConfigFromArgs() || defaultConfig;

  console.log("Configuration:");
  console.log(`- Input directory: ${config.inputDir}`);
  console.log(`- Horizontal overlay: ${config.horizontalOverlayPath}`);
  console.log(`- Vertical overlay: ${config.verticalOverlayPath}`);
  console.log(`- Output directory: ${config.outputDir}`);
  console.log(
    `- Horizontal image width: ${config.horizontalWidthPercent}% of canvas`
  );
  console.log(
    `- Vertical image width: ${config.verticalWidthPercent}% of canvas`
  );
  console.log("");

  const processor = new ImageProcessor(config);
  await processor.processImages();
}

function getConfigFromArgs(): ProcessingConfig | null {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    return null;
  }

  return {
    inputDir: args[0] || defaultConfig.inputDir,
    horizontalOverlayPath: args[1] || defaultConfig.horizontalOverlayPath,
    verticalOverlayPath: args[2] || defaultConfig.verticalOverlayPath,
    outputDir: args[3] || defaultConfig.outputDir,
    horizontalWidthPercent: defaultConfig.horizontalWidthPercent,
    verticalWidthPercent: defaultConfig.verticalWidthPercent,
  };
}

if (import.meta.main) {
  main().catch(console.error);
}
