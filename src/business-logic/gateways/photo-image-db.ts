import { IPhoto } from "../models";

export interface IPhotoImageDb {
  save: (photo: IPhoto) => Promise<void>;
  getById: (id: IPhoto["_id"]) => Promise<Buffer>;
  delete: (id: IPhoto["_id"]) => Promise<void>;
}
