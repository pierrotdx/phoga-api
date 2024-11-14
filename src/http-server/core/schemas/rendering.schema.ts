import { SortDirection } from "@domain";

import { TSchema } from "../schema";

export const RenderingSchema: TSchema = {
  type: "object",
  properties: {
    from: {
      type: "number",
    },
    size: {
      type: "number",
    },
    dateOrder: {
      enum: Object.values(SortDirection),
    },
  },
};
