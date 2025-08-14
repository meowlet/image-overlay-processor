export interface ProcessingConfig {
  inputDir: string;
  horizontalOverlayPath: string;
  verticalOverlayPath: string;
  outputDir: string;
  horizontalWidthPercent: number;
  verticalWidthPercent: number;
}

export enum ImageOrientation {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical",
}

export interface OverlayInfo {
  path: string;
  width: number;
  height: number;
  widthPercent: number;
}

export interface ImageDimensions {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface ImageMetadata {
  width: number;
  height: number;
  orientation?: number;
}
