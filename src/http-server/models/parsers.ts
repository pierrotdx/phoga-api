import { IPhoto, ISearchPhotoOptions, Photo } from "@business-logic";

import { IParser } from "./parser";

export interface IGetPhotoParser extends IParser<Photo["_id"]> {}
export interface IDeletePhotoParser extends IGetPhotoParser {}
export interface IAddPhotoParser extends IParser<IPhoto> {}
export interface IReplacePhotoParser extends IAddPhotoParser {}
export interface ISearchPhotoParser extends IParser<ISearchPhotoOptions> {}

export interface IParsers {
  addPhoto: IAddPhotoParser;
  deletePhoto: IDeletePhotoParser;
  getPhoto: IGetPhotoParser;
  replacePhoto: IReplacePhotoParser;
  searchPhoto: ISearchPhotoParser;
}
