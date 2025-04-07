import { TSchema } from "@shared/models";
import { RenderingSchema } from "@shared/schemas";

export const SearchPhotoSchema: TSchema = {
  type: "object",
  properties: {
    rendering: RenderingSchema,
    excludeImages: {
      type: "string",
    },
  },
};
