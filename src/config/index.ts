import type { ProcessingConfig } from "../types/index.js";

export const defaultConfig: ProcessingConfig = {
  inputDir: "./input",
  horizontalOverlayPath: "./overlay-horizontal.png",
  verticalOverlayPath: "./overlay-vertical.png",
  outputDir: "./output",
  horizontalWidthPercent: 82,
  verticalWidthPercent: 79,
};

export function getConfigFromArgs(): ProcessingConfig | null {
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

export function printConfig(config: ProcessingConfig): void {
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
}
