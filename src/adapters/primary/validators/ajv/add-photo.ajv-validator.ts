import {
  IAddPhotoValidator,
  imageBufferEncoding,
  TSchema,
  TValidatorData,
} from "../../../../http-server";
import { IPhoto, Photo } from "../../../../business-logic";
import { AjvValidator } from "./ajv-validator";

export class AddPhotoAjvValidator implements IAddPhotoValidator {
  private ajvValidator = new AjvValidator();

  validateAndParse(schema: TSchema, data: TValidatorData): IPhoto {
    this.ajvValidator.validate(schema, data);
    return this.parse(data);
  }

  private parse(data: TValidatorData): IPhoto {
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
  }
}
