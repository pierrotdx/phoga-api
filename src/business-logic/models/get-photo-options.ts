export enum GetPhotoField {
  Metadata = "metadata",
  ImageBuffer = "imageBuffer",
}

export interface GetPhotoOptions {
  fields?: GetPhotoField[];
}
