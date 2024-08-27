import { IPhoto } from "../models";

export interface IPhotoImageDb {
  insert: (photo: IPhoto) => Promise<void>;
  getById: (id: IPhoto["_id"]) => Promise<Buffer | undefined>;
  delete: (id: IPhoto["_id"]) => Promise<void>;
  replace: (photo: IPhoto) => Promise<void>;
  checkExists: (id: IPhoto["_id"]) => Promise<boolean>;
}
