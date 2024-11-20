import assert from "assert";
import { isEmpty } from "ramda";

import { ISearchPhotoOptions } from "@domain";

import { assertRendering } from "../is-rendering/is-rendering";

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
  assertExcludeImages(searchPhotoOptionsCandidate.excludeImages);
  assertRendering(searchPhotoOptionsCandidate.rendering);
  return true;
}

function assertExcludeImages(excludeImagesCandidate: unknown) {
  if (typeof excludeImagesCandidate !== "undefined") {
    assert(
      typeof excludeImagesCandidate === "boolean",
      "'excludeImages' should be of type boolean",
    );
  }
}
