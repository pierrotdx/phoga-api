import { SortDirection, TSchema } from "#shared/models";

export const RenderingSchema: TSchema = {
  type: "object",
  properties: {
    from: {
      type: "string",
    },
    size: {
      type: "string",
    },
    dateOrder: {
      enum: Object.values(SortDirection),
    },
  },
};
