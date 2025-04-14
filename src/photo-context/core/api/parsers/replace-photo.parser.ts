import { IReplacePhotoParser } from "photo-context/core/models";

import { AddPhotoParser } from "./add-photo/add-photo.parser";

export class ReplacePhotoParser
  extends AddPhotoParser
  implements IReplacePhotoParser {}
