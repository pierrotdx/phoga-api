import { ImageSize } from "@shared/models";

export interface IImageEditor {
  getSize(image: Buffer): ImageSize;
  resize(image: Buffer, newSize: ImageSize): Promise<Buffer>;
}
