import sizeOf from "image-size";
import sharp from "sharp";

import { ImageSize } from "@shared/models";

import { IImageEditor } from "./models";

export class ImageEditor implements IImageEditor {
  getSize(image: Buffer): ImageSize {
    const { width, height } = sizeOf(image);
    return { width, height };
  }

  async resize(image: Buffer, newSize: ImageSize): Promise<Buffer> {
    return sharp(image).resize(newSize).toBuffer();
  }
}
