import { IParser } from "#shared/models";

import { ITag } from "./tag";

export interface IAddTagParser extends IParser<ITag> {}
export interface IReplaceTagParser extends IAddTagParser {}
export interface IGetTagParser extends IParser<ITag["_id"]> {}
export interface IDeleteTagParser extends IGetTagParser {}
