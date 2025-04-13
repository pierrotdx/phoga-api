import { IRendering } from "#shared/models";

import { IPhoto, IPhotoBase } from "../..";

export interface IPhotoBaseDb {
  insert: (photo: IPhoto) => Promise<void>;
  getById: (id: IPhoto["_id"]) => Promise<IPhotoBase | undefined>;
  delete: (id: IPhoto["_id"]) => Promise<void>;
  replace: (photo: IPhoto) => Promise<void>;
  find: (rendering?: IRendering) => Promise<IPhoto[]>;
}
