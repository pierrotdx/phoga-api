import { omit } from "ramda";

import { IPhoto, IPhotoStoredData } from "../models";

export const fromPhotoStoredDataToPhoto = (
  photoStoreData: IPhotoStoredData,
): IPhoto => {
  const photo: IPhoto = omit(["manifest"], photoStoreData);
  return photo;
};
