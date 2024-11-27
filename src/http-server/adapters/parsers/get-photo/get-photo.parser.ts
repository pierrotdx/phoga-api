import { isEmpty } from "ramda";

import { IPhoto } from "@domain";
import { ImageSize } from "@shared";

import { IGetPhotoParser } from "../../../core";

export class GetPhotoParser implements IGetPhotoParser {
  parse(data: any): { _id: IPhoto["_id"]; imageSize?: ImageSize } {
    const { id, width, height } = data || {};
    const _id = id as string;
    const imageSize: ImageSize = {};
    if (width) {
      imageSize.width = parseInt(width as string);
    }
    if (height) {
      imageSize.height = parseInt(height as string);
    }
    return isEmpty(imageSize) ? { _id } : { _id, imageSize };
  }
}
