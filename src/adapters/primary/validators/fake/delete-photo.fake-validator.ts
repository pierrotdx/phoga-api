import { IPhoto } from "@business-logic";
import { IDeletePhotoValidator, TSchema, TValidatorData } from "@http-server";

export class DeletePhotoFakeValidator implements IDeletePhotoValidator {
  validateAndParse(schema: TSchema, data: TValidatorData): IPhoto["_id"] {
    return data.id as string;
  }
}
