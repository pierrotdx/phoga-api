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
  imageUrl?: string;

  constructor(
    public readonly _id: string,
    data?: {
      photoData?: Partial<IPhotoData>;
      imageBuffer?: IPhoto["imageBuffer"];
    },
  ) {
    if (data?.photoData) {
      this.initPhotoData(data.photoData);
    }

    if (data?.imageBuffer) {
      this.imageBuffer = data.imageBuffer;
    }
  }

  private initPhotoData(photoData: Partial<IPhotoData>): void {
    if (photoData.metadata) {
      this.metadata = photoData.metadata;
    }
    if (photoData.tags) {
      this.tags = photoData.tags;
    }
    if (photoData.imageUrl) {
      this.imageUrl = photoData.imageUrl;
    }
  }
}
