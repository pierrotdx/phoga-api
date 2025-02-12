import { IPhoto } from "@domain";

export function comparePhotoDates(a: IPhoto, b: IPhoto) {
  const aDate = a?.metadata?.date;
  const bDate = b?.metadata?.date;
  return compareDates(aDate, bDate);
}

export function compareDates(a: Date, b: Date): number {
  if (!isDate(a) || !isDate(b)) {
    throw new Error("both parameters should be of type Date");
  }
  const aTime = a.getTime();
  const bTime = b.getTime();
  if (aTime > bTime) {
    return 1;
  }
  if (aTime < bTime) {
    return -1;
  }
  if (aTime === bTime) {
    return 0;
  }
  throw new Error("dates cannot be compared");
}

function isDate(a: unknown) {
  return a instanceof Date;
}
