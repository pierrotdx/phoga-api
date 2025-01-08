import formidable from "formidable";
import { readFile, rm } from "fs/promises";

export class ImageBufferParser {
  private readonly localImgDir = "./tmp";
  private readonly localImg = `img`;
  private readonly maxFileSize = 1000000;

  readonly formOptions: formidable.Options = {
    uploadDir: this.localImgDir,
    filename: (name, ext, part, form) => this.localImg,
    maxFileSize: this.maxFileSize,
    createDirsFromUploads: true,
  };

  async getImageBuffer(
    files: formidable.Files<string>,
  ): Promise<Buffer | undefined> {
    const file = files.image[0];
    if (file) {
      const imageBuffer = await readFile(file.filepath);
      await rm(this.localImgDir, { recursive: true });
      return imageBuffer;
    }
  }
}
