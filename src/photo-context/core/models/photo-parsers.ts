import { IParser, IParserAsync } from "#shared/models";

import { IPhoto } from "./photo";
import { IPhotoStoredData } from "./photo-stored-data";
import { ISearchPhotoOptions } from "./search-photo-options";

// Parsed-data interfaces
export type IGetPhotoParams = IPhoto["_id"];
export type IDeletePhotoParams = IGetPhotoParams;
export interface IAddPhotoParams extends IPhotoStoredData {
  imageBuffer?: IPhoto["imageBuffer"];
}
export interface IReplacePhotoParams extends IAddPhotoParams {}
export interface ISearchPhotoParams extends ISearchPhotoOptions {}

// Parser interfaces
export interface IGetPhotoParser extends IParser<IGetPhotoParams> {}
export interface IDeletePhotoParser extends IParser<IDeletePhotoParams> {}
export interface IAddPhotoParser extends IParserAsync<IAddPhotoParams> {}
export interface IReplacePhotoParser
  extends IParserAsync<IReplacePhotoParams> {}
export interface ISearchPhotoParser extends IParser<ISearchPhotoParams> {}
