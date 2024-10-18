import { IPhoto } from "../models";

export interface IPhotoImageDb {
  insert: (photo: IPhoto) => Promise<void>;
  getById: (id: IPhoto["_id"]) => Promise<Buffer | undefined>;
  getByIds: (ids: IPhoto["_id"][]) => Promise<Record<IPhoto["_id"], Buffer>>;
  delete: (id: IPhoto["_id"]) => Promise<void>;
  replace: (photo: IPhoto) => Promise<void>;
  checkExists: (id: IPhoto["_id"]) => Promise<boolean>;
}
