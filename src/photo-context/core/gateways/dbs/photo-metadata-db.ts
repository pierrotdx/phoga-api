import { IRendering } from "#shared/models";

import { IPhoto, IPhotoMetadata } from "../../models";

export interface IPhotoMetadataDb {
  insert: (photo: IPhoto) => Promise<void>;
  getById: (id: IPhoto["_id"]) => Promise<IPhotoMetadata | undefined>;
  delete: (id: IPhoto["_id"]) => Promise<void>;
  replace: (photo: IPhoto) => Promise<void>;
  find: (rendering?: IRendering) => Promise<IPhoto[]>;
}
