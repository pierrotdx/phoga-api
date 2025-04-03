import { ITag } from "../models";

export interface ITagDb {
  insert(tag: ITag): Promise<void>;
  getById(id: ITag["_id"]): Promise<ITag>;
  delete(id: ITag["_id"]): Promise<void>;
  replace(tag: ITag): Promise<void>;
}
