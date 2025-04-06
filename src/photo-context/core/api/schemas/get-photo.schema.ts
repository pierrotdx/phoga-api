import { TSchema } from "@shared/models";
import { UuidSchema } from "@shared/uuid";

export const GetPhotoSchema: TSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: UuidSchema,
    width: {
      type: "string",
    },
    height: {
      type: "string",
    },
  },
};
