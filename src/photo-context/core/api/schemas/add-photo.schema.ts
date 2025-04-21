import { TSchema } from "#shared/models";
import { UuidSchema } from "#shared/uuid";
import { UUID } from "mongodb";

export const AddPhotoSchema: TSchema = {
  type: "object",
  required: ["_id", "imageBuffer"],
  properties: {
    _id: UuidSchema,
    imageBuffer: {
      type: "object",
    },
    metadata: {
      type: "object",
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
    tagIds: {
      type: "array",
      items: UuidSchema,
    },
  },
};
