import { TSchema } from "@http-server/schema";

export const IsoStringDateSchema: TSchema = {
  type: "string",
  format: "iso-date-time",
};
