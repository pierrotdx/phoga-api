import { Request } from "express";
import { TSchema } from "../validation-schemas/schema";

export interface IValidator<T> {
  parse: (schema: TSchema, req: Request) => T;
}
