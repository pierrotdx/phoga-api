import { IPhoto } from "@business-logic";
import { IGetPhotoParser } from "@http-server/models/parsers";

export class GetPhotoParser implements IGetPhotoParser {
  parse(data: any): IPhoto["_id"] {
    return data?.id as string;
  }
}
