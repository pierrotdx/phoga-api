import Ajv from "ajv";
import addFormat from "ajv-formats";

import {
  IAddPhotoValidator,
  TSchema,
  TValidatorData,
} from "../../../../models";
import { IPhoto, Photo } from "../../../../../../../business-logic";
import { imageBufferEncoding } from "../../../../http-server.constants";

export class AddPhotoAjvValidator implements IAddPhotoValidator {
  private readonly ajv = new Ajv();

  constructor() {
    addFormat(this.ajv);
  }

  private readonly getPhotoFromReq = (data: TValidatorData): IPhoto => {
    const { _id, imageBuffer, date, description, location } = data as Record<
      string,
      string
    >;
    const photo = new Photo(_id, {
      imageBuffer: Buffer.from(imageBuffer, imageBufferEncoding),
      metadata: {
        date: new Date(date as string),
        description: (description as string).trim(),
        location,
        titles: data.titles as string[],
      },
    });
    return photo;
  };

  parse(schema: TSchema, data: TValidatorData): IPhoto {
    try {
      const validate = this.ajv.compile(schema);
      validate(data);
      if (validate.errors?.length) {
        throw validate.errors[0];
      }
      const photo = this.getPhotoFromReq(data);
      return photo;
    } catch (err) {
      throw err;
    }
  }
}
