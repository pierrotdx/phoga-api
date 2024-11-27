import { isEmpty } from "ramda";

import { IPhoto } from "@domain";
import { IDeletePhotoParser } from "@http-server";
import { ImageSize } from "@shared";

export class DeletePhotoParser implements IDeletePhotoParser {
  parse(data: any): IPhoto["_id"] {
    return data?.id as string;
  }
}
