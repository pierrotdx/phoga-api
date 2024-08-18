import { IReplacePhotoValidator } from "../../models";
import { AddPhotoFakeValidator } from "./add-photo.fake-validator";

export class ReplacePhotoFakeValidator
  extends AddPhotoFakeValidator
  implements IReplacePhotoValidator {}
