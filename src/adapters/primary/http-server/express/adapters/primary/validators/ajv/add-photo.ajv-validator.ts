import { Request } from "express";
import Ajv from "ajv";
import addFormat from "ajv-formats";

import { IAddPhotoValidator, TSchema } from "../../../../../models";
import { IPhoto, Photo } from "../../../../../../../../business-logic";
import { imageBufferEncoding } from "../../../../../http-server.constants";

export class AddPhotoAjvValidator implements IAddPhotoValidator {
  private readonly ajv = new Ajv();

  constructor() {
    addFormat(this.ajv);
  }

  private readonly getPhotoFromReq = (req: Request): IPhoto => {
    const { _id, imageBuffer, date, description, location, titles } = req?.body;
    const photo = new Photo(_id, {
      imageBuffer: Buffer.from(imageBuffer, imageBufferEncoding),
      metadata: {
        date: new Date(date as string),
        description: (description as string).trim(),
        location,
        titles,
      },
    });
    return photo;
  };

  parse(schema: TSchema, req: Request): IPhoto {
    try {
      const validate = this.ajv.compile(schema);
      validate(req.body);
      if (validate.errors?.length) {
        throw validate.errors[0];
      }
      const photo = this.getPhotoFromReq(req);
      return photo;
    } catch (err) {
      throw err;
    }
  }
}
