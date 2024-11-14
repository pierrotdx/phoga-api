import { imageBufferEncoding } from "../constants.http-server";
import { TSchema } from "../schema";
import { IsoStringDateSchema } from "./date.schema";
import { UuidSchema } from "./uuid.schema";

export const AddPhotoSchema: TSchema = {
  type: "object",
  required: ["_id", "imageBuffer"],
  properties: {
    _id: UuidSchema,
    imageBuffer: {
      type: "string",
      contentEncoding: imageBufferEncoding,
    },
    date: IsoStringDateSchema,
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
