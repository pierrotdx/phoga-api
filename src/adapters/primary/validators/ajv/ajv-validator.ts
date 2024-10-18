import Ajv, { ValidateFunction } from "ajv";
import addFormat from "ajv-formats";

import { TSchema, TValidatorData } from "@http-server";

export class AjvValidator {
  private readonly ajv = new Ajv();
  private ajvValidate: ValidateFunction;

  private init(schema: TSchema) {
    addFormat(this.ajv);
    this.ajvValidate = this.ajv.compile(schema);
  }

  readonly validate = <T = TValidatorData>(schema: TSchema, data: T): void => {
    if (!this.ajvValidate) {
      this.init(schema);
    }
    this.ajvValidate(data);
    if (this.ajvValidate.errors?.length) {
      throw this.ajvValidate.errors[0];
    }
  };
}
