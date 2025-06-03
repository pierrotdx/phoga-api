import { IParser } from "#shared/models";

import { ISearchTagFilter } from "./search-tag-filter";
import { ISearchTagOptions } from "./search-tag-options";
import { ITag } from "./tag";

export interface ISearchTagParams {
  filter?: ISearchTagFilter;
  options?: ISearchTagOptions;
}

export interface IAddTagParser extends IParser<ITag> {}
export interface IReplaceTagParser extends IAddTagParser {}
export interface IGetTagParser extends IParser<ITag["_id"]> {}
export interface IDeleteTagParser extends IGetTagParser {}
export interface ISearchTagParser
  extends IParser<ISearchTagParams | undefined> {}
