import { TSchema } from "#shared/models";
import { RenderingSchema } from "#shared/schemas";
import { UuidSchema } from "#shared/uuid";

export const SearchPhotoSchema: TSchema = {
  type: "object",
  properties: {
    rendering: RenderingSchema,
    excludeImages: {
      type: "string",
    },
    tagId: UuidSchema,
  },
};
