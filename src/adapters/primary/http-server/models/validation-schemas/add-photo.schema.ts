import { imageBufferEncoding } from "../../http-server.constants";
import { TSchema } from "../../models";

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
      contentEncoding: imageBufferEncoding,
    },
    date: {
      type: "string",
      format: "iso-date-time",
    },
    description: {
      type: "string",
    },
    location: { type: "string" },
    titles: {
      type: "array",
      items: { type: "string" },
    },
  },
};
