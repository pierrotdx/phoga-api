import { IPhoto } from "@domain";

import { IGetPhotoParser } from "../../../core";

export class GetPhotoParser implements IGetPhotoParser {
  parse(data: any): IPhoto["_id"] {
    return data?.id as string;
  }
}
