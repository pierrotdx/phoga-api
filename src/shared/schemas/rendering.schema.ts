import { SortDirection, TSchema } from "@shared/models";

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
    width: {
      type: "string",
    },
    height: {
      type: "string",
    },
  },
};
