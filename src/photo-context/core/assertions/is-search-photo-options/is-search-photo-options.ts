import { assertRendering } from "#shared/assertions";
import { isEmpty } from "ramda";

import { ISearchPhotoOptions } from "../../models";

export function isSearchPhotoOptions(
  candidate: any,
): candidate is ISearchPhotoOptions {
  if (!candidate || isEmpty(candidate)) {
    return false;
  }
  try {
    return assertSearchPhotoOptions(candidate);
  } catch (err) {
    return false;
  }
}

export function assertSearchPhotoOptions(
  searchPhotoOptionsCandidate: any,
): boolean {
  assertRendering(searchPhotoOptionsCandidate);
  return true;
}
