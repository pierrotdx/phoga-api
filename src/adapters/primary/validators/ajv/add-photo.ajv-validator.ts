import { isEmpty } from "ramda";

import { IPhoto, IPhotoMetadata, Photo } from "@business-logic";
import {
  IAddPhotoValidator,
  TSchema,
  TValidatorData,
  imageBufferEncoding,
} from "@http-server";

import { AjvValidator } from "./ajv-validator";

export class AddPhotoAjvValidator implements IAddPhotoValidator {
  private ajvValidator = new AjvValidator();

  validateAndParse(schema: TSchema, data: TValidatorData): IPhoto {
    this.ajvValidator.validate(schema, data);
    return this.parse(data);
  }

  private parse(data: TValidatorData): IPhoto {
    const { _id, imageBuffer } = data as Record<string, string>;
    const photo = new Photo(_id, {
      imageBuffer: Buffer.from(imageBuffer, imageBufferEncoding),
    });
    this.addMetadata(photo, data);
    return photo;
  }

  private addMetadata(photo: IPhoto, data: TValidatorData) {
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
      photo.metadata = metadata;
    }
  }
}
