import { TSchema } from "../schema";
import { UuidSchema } from "./uuid.schema";

export const DeletePhotoSchema: TSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: UuidSchema,
  },
};
