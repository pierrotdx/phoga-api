import { ITag } from "#tag-context";

import { IPhoto } from "./photo";
import { IPhotoStoredData } from "./photo-stored-data";

export interface IDumbPhotoGenerator {
  generatePhoto(params?: IGeneratePhotoOptions): Promise<IPhoto>;
  generatePhotos(nbPhotos: number): Promise<IPhoto[]>;
  generatePhotoFromPath(
    imagePath: string,
    _id?: IPhoto["_id"],
  ): Promise<IPhoto>;
}

export interface IGeneratePhotoOptions {
  _id?: IPhoto["_id"];
  imageBuffer?: Buffer;
  date?: IPhoto["metadata"]["date"];
  location?: IPhoto["metadata"]["location"];
  titles?: IPhoto["metadata"]["titles"];
  description?: IPhoto["metadata"]["description"];
}

export interface IGeneratePhotoStoredDataOptions
  extends Omit<IGeneratePhotoOptions, "imageBuffer"> {
  tags?: IPhotoStoredData["tags"];
}

export interface IGenerateAddPhotoParams extends IGeneratePhotoOptions {
  tagIds?: ITag["_id"][];
}
