import { Request } from "express";
import { IPhoto, Photo } from "../../../../../business-logic";
import { IReplacePhotoValidator, TSchema } from "../../models";

export class ReplacePhotoFakeValidator implements IReplacePhotoValidator {
  parse(schema: TSchema, req: Request): IPhoto {
    const { _id, imageBuffer, date, description, location, titles } = req?.body;
    const photo = new Photo(_id, {
      imageBuffer,
      metadata: {
        date,
        description,
        location,
        titles,
      },
    });
    return photo;
  }
}
