import {
  IDeletePhotoValidator,
  TSchema,
  TValidatorData,
} from "../../../../models";
import { IPhoto } from "../../../../../../../business-logic";

export class DeletePhotoFakeValidator implements IDeletePhotoValidator {
  parse(schema: TSchema, data: TValidatorData): IPhoto["_id"] {
    return data.id as string;
  }
}
