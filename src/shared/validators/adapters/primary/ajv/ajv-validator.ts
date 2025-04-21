import { TSchema } from "#shared/models";
import { IValidator } from "#shared/validators/core";
import Ajv, { ValidateFunction } from "ajv";
import addFormat from "ajv-formats";

export class AjvValidator implements IValidator {
  private readonly ajv = new Ajv();
  private ajvValidate: ValidateFunction;

  constructor(schema: TSchema) {
    this.init(schema);
  }

  private init(schema: TSchema) {
    addFormat(this.ajv);
    this.ajvValidate = this.ajv.compile(schema);
  }

  validate<T>(data: T): void {
    this.ajvValidate(data);
    if (this.ajvValidate.errors?.length) {
      throw this.ajvValidate.errors;
    }
  }
}
