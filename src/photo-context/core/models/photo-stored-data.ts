import { ITag } from "#tag-context";

import { IPhotoData } from "./photo-data";

export interface IPhotoStoredData extends Pick<IPhotoData, "_id" | "metadata"> {
  tags?: ITag[];
}
