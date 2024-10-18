export enum GetPhotoField {
  Metadata = "metadata",
  ImageBuffer = "imageBuffer",
}

export interface IGetPhotoOptions {
  fields?: GetPhotoField[];
}
