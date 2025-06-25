import { TSchema } from "#shared/models";
import { UuidSchema } from "#shared/uuid";

export const GetTagSchema: TSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: UuidSchema,
  },
};
