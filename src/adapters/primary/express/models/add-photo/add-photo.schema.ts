import { TSchema } from "../schema";

export const AddPhotoSchema: TSchema = {
  type: "object",
  required: ["_id", "imageBuffer"],
  properties: {
    _id: {
      type: "string",
      format: "uuid",
    },
    imageBuffer: {
      type: "string",
      contentEncoding: "base64",
    },
    date: {
      type: "string",
      format: "date",
    },
    description: {
      type: "string",
    },
    location: { type: "string" },
    titles: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
};
