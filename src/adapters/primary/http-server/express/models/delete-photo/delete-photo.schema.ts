import { TSchema } from "../schema";

export const DeletePhotoSchema: TSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: {
      type: "string",
      format: "uuid",
    },
  },
};
