import { TSchema } from "../schema";

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
