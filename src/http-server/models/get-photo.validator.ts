import { IValidator } from "./validator";
import { IPhoto } from "../../business-logic";

export interface IGetPhotoValidator extends IValidator<IPhoto["_id"]> {}
