import { ITag } from "../models";

export interface ITagDb {
  insert(tag: ITag): Promise<void>;
  getById(id: ITag["_id"]): Promise<ITag>;
}
