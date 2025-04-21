export enum GetPhotoField {
  PhotoData = "photoData",
  ImageBuffer = "imageBuffer",
}

export interface IGetPhotoOptions {
  fields?: GetPhotoField[];
}
