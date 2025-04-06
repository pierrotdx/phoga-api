import { IParser, IParserAsync } from "@shared/models";

import { IPhoto, Photo } from "./photo";
import { ISearchPhotoOptions } from "./search-photo-options";

export interface IGetPhotoParser extends IParser<{ _id: Photo["_id"] }> {}
export interface IDeletePhotoParser extends IParser<IPhoto["_id"]> {}
export interface IAddPhotoParser extends IParserAsync<IPhoto> {}
export interface IReplacePhotoParser extends IAddPhotoParser {}
export interface ISearchPhotoParser extends IParser<ISearchPhotoOptions> {}

export interface IParsers {
  addPhoto: IAddPhotoParser;
  deletePhoto: IDeletePhotoParser;
  getPhoto: IGetPhotoParser;
  replacePhoto: IReplacePhotoParser;
  searchPhoto: ISearchPhotoParser;
}
