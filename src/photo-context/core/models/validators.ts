import { IValidator } from "@shared/validators";

export interface IValidators {
  addPhoto: IValidator;
  deletePhoto: IValidator;
  getPhoto: IValidator;
  replacePhoto: IValidator;
  searchPhoto: IValidator;
}
