import { IValidator } from "../../models";
import { IPhoto } from "../../../../../business-logic";

export interface IGetPhotoValidator extends IValidator<IPhoto["_id"]> {}
