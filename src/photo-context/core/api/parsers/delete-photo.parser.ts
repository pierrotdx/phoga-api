import { IDeletePhotoParser } from "../../models";
import { GetPhotoParser } from "../parsers/get-photo/get-photo.parser";

export class DeletePhotoParser
  extends GetPhotoParser
  implements IDeletePhotoParser {}
