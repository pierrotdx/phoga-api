import { isEmpty } from "ramda";

import { IPhoto, IPhotoMetadata, Photo } from "@domain";
import { assertPhoto } from "@shared";

import { IAddPhotoParser, imageBufferEncoding } from "../../../core";

export class AddPhotoParser implements IAddPhotoParser {
  private photo: IPhoto;

  parse(data: any): IPhoto {
    this.reset();
    const { _id, imageBuffer } = data;
    this.photo = new Photo(_id, {
      imageBuffer: Buffer.from(imageBuffer, imageBufferEncoding),
    });
    this.addMetadata(data);
    assertPhoto(this.photo);
    return this.photo;
  }

  private reset() {
    delete this.photo;
  }

  private addMetadata(data: any) {
    const { date, description, location } = data as Record<string, string>;
    const metadata: IPhotoMetadata = {};
    if (date) {
      metadata.date = new Date(date);
    }
    if (description) {
      metadata.description = description;
    }
    if (location) {
      metadata.location = location;
    }
    const titles = data.titles as string[];
    if (titles?.length) {
      metadata.titles = titles;
    }
    if (!isEmpty(metadata)) {
      this.photo.metadata = metadata;
    }
  }
}
