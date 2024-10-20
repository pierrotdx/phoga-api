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
    dateOrder: {
      enum: Object.values(SortDirection),
    },
  },
};
