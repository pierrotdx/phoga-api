import { TSchema } from "../validation-schemas/schema";

export type TValidatorData = Record<string, unknown>;

export interface IValidator<T> {
  parse: (schema: TSchema, data: TValidatorData) => T;
}
