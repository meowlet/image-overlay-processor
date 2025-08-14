import { promises as fs } from "fs";
import path from "path";

export class FileSystemService {
  static async validatePaths(paths: string[]): Promise<void> {
    for (const filePath of paths) {
      try {
        await fs.access(filePath);
      } catch {
        throw new Error(`Path does not exist: ${filePath}`);
      }
    }
  }

  static async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    }
  }

  static async getImageFiles(directory: string): Promise<string[]> {
    const files = await fs.readdir(directory);
    const imageExtensions = [".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"];

    return files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });
  }
}
