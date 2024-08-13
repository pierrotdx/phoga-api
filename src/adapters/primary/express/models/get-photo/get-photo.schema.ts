import { TSchema } from "../schema";

export interface IGetPhotoSchema {
  id: string;
}

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
