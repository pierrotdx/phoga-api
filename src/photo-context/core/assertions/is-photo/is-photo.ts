import assert from "assert";

import { isUuid } from "@shared/uuid";

import { IPhoto } from "../../models";

export function isPhoto(candidate: any): candidate is IPhoto {
  if (!candidate) {
    return false;
  }
  try {
    return assertPhoto(candidate);
  } catch (err) {
    return false;
  }
}

export function assertPhoto(photoCandidate: any) {
  assertPhotoId(photoCandidate._id);
  assertPhotoImageBuffer(photoCandidate.imageBuffer);
  if (photoCandidate.metadata) {
    assertPhotoMetadata(photoCandidate.metadata);
  }
  return true;
}

function assertPhotoId(photoIdCandidate: any) {
  assert(!!photoIdCandidate, "no id provided");
  assert(isUuid(photoIdCandidate), "invalid id format (should be uuid)");
}

function assertPhotoImageBuffer(imageBufferCandidate: any) {
  assert(!!imageBufferCandidate, "no image buffer provided");
  assert(
    imageBufferCandidate instanceof Buffer,
    "should be an instance of buffer",
  );
}

function assertPhotoMetadata(metadataCandidate: any) {
  if (metadataCandidate.date) {
    assert(
      metadataCandidate.date instanceof Date,
      "photo.metadata.date: should be instance of date",
    );
  }
  if (metadataCandidate.location) {
    assert(typeof metadataCandidate.location === "string");
  }
  if (metadataCandidate.description) {
    assert(typeof metadataCandidate.description === "string");
  }
  if (metadataCandidate.titles) {
    assert(Array.isArray(metadataCandidate.titles));
    (metadataCandidate.titles as Array<unknown>).forEach((title) => {
      assert(typeof title === "string");
    });
  }
}
