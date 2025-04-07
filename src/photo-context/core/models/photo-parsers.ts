import { IParser, IParserAsync } from "#shared/models";

import { IPhoto, Photo } from "./photo";
import { ISearchPhotoOptions } from "./search-photo-options";

export interface IGetPhotoParser extends IParser<Photo["_id"]> {}
export interface IDeletePhotoParser extends IParser<IPhoto["_id"]> {}
export interface IAddPhotoParser extends IParserAsync<IPhoto> {}
export interface IReplacePhotoParser extends IAddPhotoParser {}
export interface ISearchPhotoParser extends IParser<ISearchPhotoOptions> {}
