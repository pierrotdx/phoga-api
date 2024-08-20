import { IPhoto, Photo } from "../../../../../../../business-logic";
import { imageBufferEncoding } from "../../../../http-server.constants";
import {
  IAddPhotoValidator,
  TSchema,
  TValidatorData,
} from "../../../../models";

export class AddPhotoFakeValidator implements IAddPhotoValidator {
  parse(schema: TSchema, data: TValidatorData): IPhoto {
    const { _id, imageBuffer, date, description, location, titles } =
      data as Record<string, string>;
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
