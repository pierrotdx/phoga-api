import { IParser, IParserAsync } from "#shared/models";
import { ITag } from "#tag-context";

import { IPhoto } from "./photo";
import { ISearchPhotoFilter } from "./search-photo-filter";
import { ISearchPhotoOptions } from "./search-photo-options";

// Parsed-data interfaces
export type IGetPhotoParams = IPhoto["_id"];
export type IDeletePhotoParams = IGetPhotoParams;
export interface IAddPhotoParams extends IPhoto {
  tagIds?: ITag["_id"][];
}
export interface IReplacePhotoParams extends IAddPhotoParams {}
export interface ISearchPhotoParams {
  filter?: ISearchPhotoFilter;
  options?: ISearchPhotoOptions;
}

// Parser interfaces
export interface IGetPhotoParser extends IParser<IGetPhotoParams> {}
export interface IDeletePhotoParser extends IParser<IDeletePhotoParams> {}
export interface IAddPhotoParser extends IParserAsync<IAddPhotoParams> {}
export interface IReplacePhotoParser
  extends IParserAsync<IReplacePhotoParams> {}
export interface ISearchPhotoParser extends IParser<ISearchPhotoParams> {}
