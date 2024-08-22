import { IPhoto } from "@business-logic";
import { IGetPhotoValidator, TSchema, TValidatorData } from "@http-server";

export class GetPhotoFakeValidator implements IGetPhotoValidator {
  validateAndParse(schema: TSchema, data: TValidatorData): IPhoto["_id"] {
    return data.id as string;
  }
}
