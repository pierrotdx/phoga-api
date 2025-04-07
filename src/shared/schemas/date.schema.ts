import { TSchema } from "@shared/models";

export const IsoStringDateSchema: TSchema = {
  type: "string",
  format: "iso-date-time",
};
