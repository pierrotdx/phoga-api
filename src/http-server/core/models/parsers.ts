import { IPhoto, ISearchPhotoOptions, Photo } from "@domain";
import { ImageSize } from "@shared";

import { IParser, IParserAsync } from "./parser";

export interface IGetPhotoParser
  extends IParser<{ _id: Photo["_id"]; imageSize?: ImageSize }> {}
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
