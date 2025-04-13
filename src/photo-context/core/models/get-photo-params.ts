export enum GetPhotoField {
  Base = "base",
  ImageBuffer = "imageBuffer",
}

export interface IGetPhotoOptions {
  fields?: GetPhotoField[];
}
