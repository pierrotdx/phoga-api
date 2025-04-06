import { IGetPhotoParser, IPhoto } from '../../../';

export class GetPhotoParser implements IGetPhotoParser {
  parse(data: any): IPhoto['_id'] {
    return data.id as string;
  }
}
