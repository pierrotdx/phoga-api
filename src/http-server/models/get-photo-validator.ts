import { IPhoto } from "../../business-logic";
import { IValidator } from "./validator";

export interface IGetPhotoValidator extends IValidator<IPhoto["_id"]> {}
