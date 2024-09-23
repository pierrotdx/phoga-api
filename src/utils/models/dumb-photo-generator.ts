import { IPhoto } from "@business-logic";


export interface IDumbPhotoGenerator {
  generate(params?: IDumbPhotoGeneratorOptions): IPhoto;
}

export interface IDumbPhotoGeneratorOptions {
  _id?: IPhoto["_id"];
  imageBuffer?: Buffer;
  date?: IPhoto["metadata"]["date"];
  location?: IPhoto["metadata"]["location"];
  titles?: IPhoto["metadata"]["titles"];
  description?: IPhoto["metadata"]["description"];
}