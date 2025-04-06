import { IGetPhotoParser, IPhoto } from '../../../';

export class GetPhotoParser implements IGetPhotoParser {
  parse(data: any): { _id: IPhoto["_id"] } {
    const _id = data.id as string;
    return { _id };
  }
}
