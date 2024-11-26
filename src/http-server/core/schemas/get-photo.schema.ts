import { TSchema } from "../schema";
import { UuidSchema } from "./uuid.schema";

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
