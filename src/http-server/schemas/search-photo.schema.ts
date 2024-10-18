import { TSchema } from "../schema";
import { RenderingSchema } from "./rendering.schema";

export const SearchPhotoSchema: TSchema = {
  type: "object",
  properties: {
    rendering: RenderingSchema,
    excludeImages: {
      type: "boolean",
    },
  },
};
