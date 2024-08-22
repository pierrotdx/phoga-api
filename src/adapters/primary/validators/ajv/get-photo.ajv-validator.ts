import { IPhoto } from "../../../../business-logic";
import {
  IGetPhotoValidator,
  TSchema,
  TValidatorData,
} from "../../../../http-server";
import { AjvValidator } from "./ajv-validator";

export class GetPhotoAjvValidator implements IGetPhotoValidator {
  private ajvValidator = new AjvValidator();

  validateAndParse(schema: TSchema, data: TValidatorData): IPhoto["_id"] {
    this.ajvValidator.validate(schema, data);
    return this.parse(data);
  }

  private parse(data: TValidatorData): IPhoto["_id"] {
    return data?.id as string;
  }
}
