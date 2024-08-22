import { IPhoto } from "../../business-logic";
import { IValidator } from "./validator";

export interface IDeletePhotoValidator extends IValidator<IPhoto["_id"]> {}
