import { TSchema } from "@http-server/schema";

export const UuidSchema: TSchema = {
  type: "string",
  format: "uuid",
};
