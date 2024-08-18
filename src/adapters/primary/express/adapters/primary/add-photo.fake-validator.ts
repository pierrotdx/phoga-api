import { Request } from "express";
import { IAddPhotoValidator, TSchema } from "../../models";
import { IPhoto, Photo } from "../../../../../business-logic";

export class AddPhotoFakeValidator implements IAddPhotoValidator {
  parse(schema: TSchema, req: Request): IPhoto {
    const { _id, imageBuffer, date, description, location, titles } = req?.body;
    const photo = new Photo(_id, {
      imageBuffer: Buffer.from(imageBuffer, "base64"),
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
