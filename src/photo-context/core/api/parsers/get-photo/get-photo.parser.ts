import { Request } from "express";

import { IGetPhotoParser, IPhoto } from "../../../";

export class GetPhotoParser implements IGetPhotoParser {
  parse(data: Request): IPhoto["_id"] {
    return data.params.id as string;
  }
}
