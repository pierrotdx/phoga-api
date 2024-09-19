import assert from "assert";

import { IPhoto } from "@business-logic";

export function isPhoto(candidate: any): candidate is IPhoto {
  if (!candidate) {
    return false;
  }
  try {
    assert(!!candidate._id, "no id provided");
    assert(!!candidate.imageBuffer, "no image buffer provided");
    assert(
      candidate.imageBuffer instanceof Buffer,
      "should be an instance of buffer",
    );
    if (!candidate.metadata) {
      return true;
    }
    if (candidate.metadata?.date) {
      assert(candidate.metadata.date instanceof Date);
    }
    if (candidate.metadata?.location) {
      assert(typeof candidate.metadata.location === "string");
    }
    if (candidate.metadata?.description) {
      assert(typeof candidate.metadata.description === "string");
    }
    if (candidate.metadata?.titles) {
      assert(Array.isArray(candidate.metadata.titles));
      assert(typeof candidate.metadata.titles[0] === "string");
    }
    return true;
  } catch (err) {
    return false;
  }
}
