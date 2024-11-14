import { IValidator } from "./validator";

export interface IValidators {
  addPhoto: IValidator;
  deletePhoto: IValidator;
  getPhoto: IValidator;
  replacePhoto: IValidator;
  searchPhoto: IValidator;
}
