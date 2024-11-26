import { ImageSize } from "@shared";

export enum GetPhotoField {
  Metadata = "metadata",
  ImageBuffer = "imageBuffer",
}

export interface IGetPhotoOptions {
  fields?: GetPhotoField[];
  imageSize?: ImageSize;
}
