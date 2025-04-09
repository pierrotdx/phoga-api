import { TSchema } from "#shared/models";

export const SearchTagSchema: TSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
  },
};
