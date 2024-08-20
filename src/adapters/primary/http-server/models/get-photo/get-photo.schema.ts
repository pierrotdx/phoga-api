import { TSchema } from "../../models";

export const GetPhotoSchema: TSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: {
      type: "string",
      format: "uuid",
    },
  },
};
