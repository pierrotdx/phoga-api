import formidable, { Fields } from "formidable";
import { isEmpty } from "ramda";

import { IPhoto, IPhotoMetadata, Photo } from "@domain";
import { assertPhoto } from "@shared";

import { IAddPhotoParser } from "../../../core";
import { ImageBufferParser } from "../image-buffer-parser";

export class AddPhotoParser implements IAddPhotoParser {
  private photo: IPhoto;
  private imageBufferParser = new ImageBufferParser();

  async parse(data: any): Promise<IPhoto> {
    this.reset();
    const form = formidable(this.imageBufferParser.formOptions);
    const [fields, files] = await form.parse(data);
    const _id = fields._id[0];
    this.photo = new Photo(_id);
    this.addMetadata(fields);
    await this.addImageBuffer(files);
    assertPhoto(this.photo);
    return this.photo;
  }

  private async addImageBuffer(files: formidable.Files<string>): Promise<void> {
    const imageBuffer = await this.imageBufferParser.getImageBuffer(files);
    if (imageBuffer) {
      this.photo.imageBuffer = imageBuffer;
    }
  }

  private reset() {
    delete this.photo;
  }

  private addMetadata(data: Fields) {
    if (!data) {
      return;
    }
    const metadata: IPhotoMetadata = {};
    const stringDate = data.date?.[0];
    if (stringDate) {
      metadata.date = new Date(stringDate);
    }
    const description = data.description?.[0];
    if (description) {
      metadata.description = description;
    }
    const location = data.location?.[0];
    if (location) {
      metadata.location = location;
    }
    const titles = data.titles?.[0].split(",") as string[];
    if (titles?.length) {
      metadata.titles = titles;
    }
    if (!isEmpty(metadata)) {
      this.photo.metadata = metadata;
    }
  }
}
