import { IPhoto, Photo } from "@business-logic";
import {
  IAddPhotoValidator,
  TSchema,
  TValidatorData,
  imageBufferEncoding,
} from "@http-server";

export class AddPhotoFakeValidator implements IAddPhotoValidator {
  validateAndParse(schema: TSchema, data: TValidatorData): IPhoto {
    const { _id, imageBuffer, date, description, location } = data as Record<
      string,
      string
    >;
    const photo = new Photo(_id, {
      imageBuffer: Buffer.from(imageBuffer, imageBufferEncoding),
      metadata: {
        date: new Date(date as string),
        description,
        location,
        titles: data.titles as string[],
      },
    });
    return photo;
  }
}
