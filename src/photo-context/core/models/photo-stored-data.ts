import { ITag } from "#tag-context";

import { IPhotoData } from "./photo-data";

export interface IPhotoStoredData extends IPhotoData {
  tags?: ITag[];
}
