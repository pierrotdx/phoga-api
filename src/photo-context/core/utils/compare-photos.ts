import { compareDates } from "#shared/compare-dates";

import { IPhoto } from "../models";

export const comparePhotoDates = (a: IPhoto, b: IPhoto) => {
  const aDate = a?.metadata?.date;
  const bDate = b?.metadata?.date;
  return compareDates(aDate, bDate);
};
