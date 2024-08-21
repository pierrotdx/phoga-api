import { TSchema } from "../../models";

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
