import { IDeletePhotoParser, IPhoto } from "../../../";

export class DeletePhotoParser implements IDeletePhotoParser {
  parse(data: any): IPhoto["_id"] {
    return data?.id as string;
  }
}
