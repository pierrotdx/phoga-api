import { Request } from "express";

import { IPhoto, Photo } from "../../../../../../../business-logic";
import { imageBufferEncoding } from "../../../../http-server.constants";
import { IAddPhotoValidator, TSchema } from "../../../../models";

export class AddPhotoFakeValidator implements IAddPhotoValidator {
  parse(schema: TSchema, req: Request): IPhoto {
    const { _id, imageBuffer, date, description, location, titles } = req?.body;
    const photo = new Photo(_id, {
      imageBuffer: Buffer.from(imageBuffer, imageBufferEncoding),
      metadata: {
        date: new Date(date as string),
        description,
        location,
        titles: titles.split(","),
      },
    });
    return photo;
  }
}
