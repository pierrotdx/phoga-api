import { TSchema } from "#shared/models";
import { RenderingSchema } from "#shared/schemas";
import { UuidSchema } from "#shared/uuid";

export const SearchPhotoSchema: TSchema = {
  allOf: [RenderingSchema],
  type: "object",
  properties: {
    tagId: UuidSchema,
  },
};
