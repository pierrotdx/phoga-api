import { IImageEditor } from "@shared";

import { IPhoto, IThumbnailSetter, thumbnailSize } from "./models";

export class ThumbnailSetter implements IThumbnailSetter {
  constructor(private readonly imageEditor: IImageEditor) {}

  async set(photo: IPhoto): Promise<void> {
    const thumbnail = await this.imageEditor.resize(
      photo.imageBuffer,
      thumbnailSize,
    );
    if (!photo.metadata) {
      photo.metadata = {};
    }
    photo.metadata.thumbnail = thumbnail;
  }
}
