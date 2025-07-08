import { IPhoto } from "#photo-context";

export function expectedImageUrl({
  apiBaseUrl,
  bucket,
  id,
}: {
  apiBaseUrl: string;
  bucket: string;
  id: IPhoto["_id"];
}): string {
  return `${apiBaseUrl}/${bucket}/${id}`;
}
