import sharp from "sharp";
import type {
  ImageOrientation,
  OverlayInfo,
  ProcessingConfig,
} from "../types/index.js";

export class OverlayService {
  private config: ProcessingConfig;

  constructor(config: ProcessingConfig) {
    this.config = config;
  }

  async getOverlayInfo(orientation: ImageOrientation): Promise<OverlayInfo> {
    const overlayPath =
      orientation === "horizontal"
        ? this.config.horizontalOverlayPath
        : this.config.verticalOverlayPath;

    const widthPercent =
      orientation === "horizontal"
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
}
