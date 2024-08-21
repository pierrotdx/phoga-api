import { TSchema } from "../validation-schemas/schema";

export type TValidatorData = Record<string, unknown>;

export interface IValidator<T> {
  validateAndParse: (schema: TSchema, data: TValidatorData) => T;
}
