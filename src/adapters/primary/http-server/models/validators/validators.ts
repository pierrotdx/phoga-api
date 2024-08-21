import { IAddPhotoValidator } from "./add-photo.validator";
import { IDeletePhotoValidator } from "./delete-photo.validator";
import { IGetPhotoValidator } from "./get-photo.validator";
import { IReplacePhotoValidator } from "./replace-photo.validator";

export interface IValidators {
  addPhoto: IAddPhotoValidator;
  deletePhoto: IDeletePhotoValidator;
  getPhoto: IGetPhotoValidator;
  replacePhoto: IReplacePhotoValidator;
}
