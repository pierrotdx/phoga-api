import { IReplacePhotoValidator } from "../../../../http-server";
import { AddPhotoFakeValidator } from "./add-photo.fake-validator";

export class ReplacePhotoFakeValidator
  extends AddPhotoFakeValidator
  implements IReplacePhotoValidator {}
