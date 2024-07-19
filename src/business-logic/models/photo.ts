import { IPhotoMetadata } from "./photo-metadata";

export interface IPhoto {
  _id: string;
  metadata?: IPhotoMetadata;
  imageBuffer?: Buffer;
}

export class Photo implements IPhoto {
  metadata?: IPhotoMetadata;
  imageBuffer?: Buffer;

  constructor(
    public readonly _id: string,
    private readonly data?: {
      metadata?: IPhoto["metadata"];
      imageBuffer?: IPhoto["imageBuffer"];
    },
  ) {
    this.metadata = data?.metadata;
    this.imageBuffer = data?.imageBuffer;
  }
}
