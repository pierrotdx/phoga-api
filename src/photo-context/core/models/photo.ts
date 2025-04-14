import { IPhotoData } from "./photo-data";
import { IPhotoMetadata } from "./photo-metadata";

export interface IPhoto extends IPhotoData {
  imageBuffer?: Buffer;
}

export class Photo implements IPhoto {
  metadata?: IPhotoMetadata;
  imageBuffer?: Buffer;

  constructor(
    public readonly _id: string,
    data?: {
      metadata?: IPhoto["metadata"];
      imageBuffer?: IPhoto["imageBuffer"];
    },
  ) {
    if (data?.metadata) {
      this.metadata = data.metadata;
    }
    if (data?.imageBuffer) {
      this.imageBuffer = data.imageBuffer;
    }
  }
}
