import { ITag } from "#tag-context";

import { IPhoto } from "./photo";
import { IAddPhotoParams } from "./photo-parsers";
import { IPhotoStoredData } from "./photo-stored-data";

export interface IDumbPhotoGenerator {
  generatePhoto(params?: IGeneratePhotoOptions): Promise<IPhoto>;
  generatePhotos(nbPhotos: number): Promise<IPhoto[]>;
  generatePhotoStoredData(
    options?: IGeneratePhotoStoredDataOptions,
  ): IPhotoStoredData;
  generatePhotosStoredData(
    nb: number,
    options?: IGeneratePhotoStoredDataOptions,
  ): IPhotoStoredData[];
  generateAddPhotoParams(
    options?: IGenerateAddPhotoParams,
  ): Promise<IAddPhotoParams>;
}

export interface IGeneratePhotoOptions {
  _id?: IPhoto["_id"];
  imageBuffer?: Buffer;
  date?: IPhoto["metadata"]["date"];
  location?: IPhoto["metadata"]["location"];
  titles?: IPhoto["metadata"]["titles"];
  description?: IPhoto["metadata"]["description"];
  noImageBuffer?: boolean;
}

export interface IGeneratePhotoStoredDataOptions
  extends Omit<IGeneratePhotoOptions, "imageBuffer"> {
  tags?: IPhotoStoredData["tags"];
}

export interface IGenerateAddPhotoParams extends IGeneratePhotoOptions {
  tagIds?: ITag["_id"][];
}
