import { IPhoto } from "../../business-logic";
import { IValidator } from "./validator";

export interface IAddPhotoValidator extends IValidator<IPhoto> {}
