import { IPhotoData, IPhotoStoredData } from "./models";

export function photoStoredDataToPhotoData(
  storedPhotoData: IPhotoStoredData,
): IPhotoData {
  const photoData: IPhotoData = {
    _id: storedPhotoData._id,
    metadata: storedPhotoData.metadata,
  };
  return photoData;
}
