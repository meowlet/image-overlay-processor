import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

interface ProcessingConfig {
  inputDir: string;
  overlayPath: string;
  outputDir: string;
  overlayPosition: { x: number; y: number };
  targetWidth: number;
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
      await fs.access(this.config.overlayPath);
    } catch {
      throw new Error(
        `Overlay file does not exist: ${this.config.overlayPath}`
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

  private async processImage(filename: string): Promise<void> {
    const inputPath = path.join(this.config.inputDir, filename);
    const outputPath = path.join(this.config.outputDir, filename);

    const overlayImage = sharp(this.config.overlayPath);
    const overlayMetadata = await overlayImage.metadata();

    if (!overlayMetadata.width || !overlayMetadata.height) {
      throw new Error(
        `Unable to read overlay image dimensions: ${this.config.overlayPath}`
      );
    }

    const image = sharp(inputPath);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error(`Unable to read image dimensions: ${filename}`);
    }

    const aspectRatio = metadata.height / metadata.width;
    const newHeight = Math.round(this.config.targetWidth * aspectRatio);

    const resizedImageBuffer = await image
      .resize(this.config.targetWidth, newHeight, {
        fit: "fill",
      })
      .png()
      .toBuffer();

    const canvas = sharp({
      create: {
        width: overlayMetadata.width,
        height: overlayMetadata.height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      },
    });

    await canvas
      .composite([
        {
          input: resizedImageBuffer,
          left: this.config.overlayPosition.x,
          top: this.config.overlayPosition.y,
        },
        {
          input: this.config.overlayPath,
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
  overlayPath: "./overlay.png",
  outputDir: "./output",
  overlayPosition: { x: 404, y: 232 },
  targetWidth: 5192,
};

async function main() {
  console.log("🖼️  Image Overlay Processor");
  console.log("================================");

  const config = getConfigFromArgs() || defaultConfig;

  console.log("Configuration:");
  console.log(`- Input directory: ${config.inputDir}`);
  console.log(`- Overlay file: ${config.overlayPath}`);
  console.log(`- Output directory: ${config.outputDir}`);
  console.log(
    `- Overlay position: x=${config.overlayPosition.x}, y=${config.overlayPosition.y}`
  );
  console.log(`- Target width: ${config.targetWidth}px`);
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
    overlayPath: args[1] || defaultConfig.overlayPath,
    outputDir: args[2] || defaultConfig.outputDir,
    overlayPosition: defaultConfig.overlayPosition,
    targetWidth: defaultConfig.targetWidth,
  };
}

if (import.meta.main) {
  main().catch(console.error);
}
