import { IPhoto } from "@business-logic";
import { IDeletePhotoValidator, TSchema, TValidatorData } from "@http-server";
import { AjvValidator } from "./ajv-validator";

export class DeletePhotoAjvValidator implements IDeletePhotoValidator {
  private readonly ajvValidator = new AjvValidator();

  validateAndParse(schema: TSchema, data: TValidatorData): IPhoto["_id"] {
    this.ajvValidator.validate(schema, data);
    return this.parse(data);
  }

  private parse(data: TValidatorData): IPhoto["_id"] {
    return data.id as string;
  }
}
