import { imageBufferEncoding } from "@shared";

import { TSchema } from "../schema";
import { IsoStringDateSchema } from "./date.schema";
import { UuidSchema } from "./uuid.schema";

export const AddPhotoSchema: TSchema = {
  type: "object",
  required: ["_id", "imageBuffer"],
  properties: {
    _id: UuidSchema,
    imageBuffer: {
      type: "object",
    },
    metadata: {
      properties: {
        date: {
          type: "object",
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
    },
  },
};
