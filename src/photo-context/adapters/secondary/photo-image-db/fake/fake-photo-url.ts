import { IPhoto } from "photo-context/core";

export const getFakePhotoImageUrl = (id: IPhoto["_id"]) =>
  `https://no-url.com/${id}`;
