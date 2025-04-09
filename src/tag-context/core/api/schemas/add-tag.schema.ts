import { TSchema } from "#shared/models";
import { UuidSchema } from "#shared/uuid";

export const AddTagSchema: TSchema = {
  type: "object",
  required: ["_id"],
  properties: {
    _id: UuidSchema,
    name: { type: "string" },
  },
};
