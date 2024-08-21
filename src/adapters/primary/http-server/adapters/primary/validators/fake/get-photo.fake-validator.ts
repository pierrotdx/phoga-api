import {
  IGetPhotoValidator,
  TSchema,
  TValidatorData,
} from "../../../../models";
import { IPhoto } from "../../../../../../../business-logic";

export class GetPhotoFakeValidator implements IGetPhotoValidator {
  validateAndParse(schema: TSchema, data: TValidatorData): IPhoto["_id"] {
    return data.id as string;
  }
}
