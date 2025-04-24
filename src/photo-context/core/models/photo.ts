import { ITag } from "#tag-context";

import { IPhotoData } from "./photo-data";
import { IPhotoMetadata } from "./photo-metadata";

export interface IPhoto extends IPhotoData {
  imageBuffer?: Buffer;
}

export class Photo implements IPhoto {
  metadata?: IPhotoMetadata;
  imageBuffer?: Buffer;
  tags?: ITag[];

  constructor(
    public readonly _id: string,
    data?: {
      photoData?: Partial<IPhotoData>;
      imageBuffer?: IPhoto["imageBuffer"];
    },
  ) {
    if (data?.photoData?.metadata) {
      this.metadata = data?.photoData?.metadata;
    }
    if (data?.photoData?.tags) {
      this.tags = data.photoData.tags;
    }
    if (data?.imageBuffer) {
      this.imageBuffer = data.imageBuffer;
    }
  }
}
