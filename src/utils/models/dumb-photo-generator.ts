import { IPhoto } from "@business-logic";

export interface IDumbPhotoGenerator {
  generatePhoto(params?: IDumbPhotoGeneratorOptions): IPhoto;
  generatePhotos(nbPhotos: number): IPhoto[];
  generatePhotoFromPath(
    imagePath: string,
    _id?: IPhoto["_id"],
  ): Promise<IPhoto>;
}

export interface IDumbPhotoGeneratorOptions {
  _id?: IPhoto["_id"];
  imageBuffer?: Buffer;
  date?: IPhoto["metadata"]["date"];
  location?: IPhoto["metadata"]["location"];
  titles?: IPhoto["metadata"]["titles"];
  description?: IPhoto["metadata"]["description"];
}
