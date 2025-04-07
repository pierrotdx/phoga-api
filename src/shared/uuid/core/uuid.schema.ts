import { TSchema } from "#shared/models";

export const UuidSchema: TSchema = {
  type: "string",
  format: "uuid",
};
