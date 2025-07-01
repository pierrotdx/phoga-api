import { IRendering, SortDirection } from "#shared/models";
import assert from "assert";
import { isEmpty } from "ramda";

export function isRendering(candidate: any): candidate is IRendering {
  if (!candidate || isEmpty(candidate)) {
    return false;
  }
  try {
    return assertRendering(candidate);
  } catch (err) {
    console.error(err);
    return false;
  }
}

export function assertRendering(renderingCandidate: any): boolean {
  if (renderingCandidate) {
    assertSize(renderingCandidate.size);
    assertFrom(renderingCandidate.from);
    assertDateOrder(renderingCandidate.dateOrder);
  }
  return true;
}

function assertSize(sizeCandidate: unknown) {
  if (typeof sizeCandidate !== "undefined") {
    assert(
      typeof sizeCandidate === "number",
      "'size' should be of type number",
    );
  }
}

function assertFrom(fromCandidate: unknown) {
  if (typeof fromCandidate !== "undefined") {
    assert(
      typeof fromCandidate === "number",
      "'from' should be of type number",
    );
  }
}

function assertDateOrder(dateOrderCandidate: unknown) {
  if (dateOrderCandidate) {
    assert(
      typeof dateOrderCandidate === "string",
      "'dateOrder' should be of type string",
    );
    const sortDirections = Object.values(SortDirection) as string[];
    const hasValidValue = sortDirections.includes(dateOrderCandidate);
    assert(
      hasValidValue,
      `'dateOrder' should belong to the following list ${sortDirections.join(", ")}`,
    );
  }
}
