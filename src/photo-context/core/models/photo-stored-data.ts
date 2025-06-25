import { IManifest } from "#shared/models";

import { IPhotoData } from "./photo-data";

export interface IPhotoStoredData extends IPhotoData {
  manifest?: IManifest;
}
