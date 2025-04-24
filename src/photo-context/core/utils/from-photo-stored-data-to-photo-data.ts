import { IPhotoData, IPhotoStoredData } from "../models";

export function fromPhotoStoredDataToPhotoData(
  storedPhotoData: IPhotoStoredData,
): IPhotoData {
  const photoData: IPhotoData = {
    _id: storedPhotoData._id,
    metadata: storedPhotoData.metadata,
    tags: storedPhotoData.tags,
  };
  return photoData;
}
