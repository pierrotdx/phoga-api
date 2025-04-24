import { Request } from "express";
import formidable, { Fields } from "formidable";
import { isEmpty } from "ramda";

import {
  IAddPhotoParams,
  IAddPhotoParser,
  IPhotoMetadata,
  Photo,
} from "../../../models";
import { ImageBufferParser } from "../image-buffer-parser";

export class AddPhotoParser implements IAddPhotoParser {
  private addPhotoParams: IAddPhotoParams;
  private imageBufferParser = new ImageBufferParser();

  async parse(req: Request): Promise<IAddPhotoParams> {
    this.reset();
    const form = formidable(this.imageBufferParser.formOptions);
    const [fields, files] = await form.parse(req);
    const _id = fields._id[0];
    this.addPhotoParams = new Photo(_id);
    this.addMetadata(fields);
    this.addTagIds(fields);
    await this.addImageBuffer(files);
    return this.addPhotoParams;
  }
  addTagIds(data: Fields) {
    const tagIds = data?.tagIds;
    if (tagIds) {
      this.addPhotoParams.tagIds = tagIds[0].split(",");
    }
  }

  private async addImageBuffer(files: formidable.Files<string>): Promise<void> {
    const imageBuffer = await this.imageBufferParser.getImageBuffer(files);
    if (imageBuffer) {
      this.addPhotoParams.imageBuffer = imageBuffer;
    }
  }

  private reset() {
    delete this.addPhotoParams;
  }

  private addMetadata(data: Fields) {
    if (!data) {
      return;
    }
    const metadata: IPhotoMetadata = {};
    const stringDate = data.date?.[0];
    if (stringDate) {
      metadata.date = this.getDate(stringDate);
    }
    const description = data.description?.[0];
    if (description) {
      metadata.description = description;
    }
    const location = data.location?.[0];
    if (location) {
      metadata.location = location;
    }
    const titles = data.titles;
    if (titles?.length) {
      metadata.titles = titles[0].split(",");
    }
    if (!isEmpty(metadata)) {
      this.addPhotoParams.metadata = metadata;
    }
  }

  private getDate(stringDate: string): Date {
    const date = new Date(stringDate);
    const isValidDate = date.toISOString() === stringDate;
    if (!isValidDate) {
      throw new Error(`invalid date '${stringDate}'`);
    }
    return date;
  }
}
