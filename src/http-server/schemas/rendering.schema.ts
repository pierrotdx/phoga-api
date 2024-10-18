import { SortDirection } from "@business-logic";

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
    date: {
      enum: Object.values(SortDirection),
    },
  },
};
