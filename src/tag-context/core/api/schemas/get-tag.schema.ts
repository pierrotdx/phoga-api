import { TSchema } from "#shared/models";
import { UuidSchema } from "#shared/uuid";

export const GetTagSchema: TSchema = {
  type: "object",
  required: ["_id"],
  properties: {
    _id: UuidSchema,
  },
};
