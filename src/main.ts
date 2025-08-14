import { ImageProcessor } from "./services/imageProcessor.js";
import {
  defaultConfig,
  getConfigFromArgs,
  printConfig,
} from "./config/index.js";

async function main() {
  console.log("Image Overlay Processor (Optimized)");
  console.log("=========================================");

  const config = getConfigFromArgs() || defaultConfig;
  printConfig(config);

  const processor = new ImageProcessor(config);
  await processor.processImages();
}

if (import.meta.main) {
  main().catch(console.error);
}
