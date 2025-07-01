export function isUuid(candidate: any) {
  if (typeof candidate !== "string") {
    return false;
  }
  // should match all uuids version from v1 to v5: https://stackoverflow.com/a/13653180/6281776
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const matchedString = RegExp(uuidRegex).exec(candidate)?.[0];
  if (!matchedString) {
    return false;
  }
  return matchedString === candidate;
}
