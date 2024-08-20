import { IPhoto } from "../../../../../business-logic";
import { IValidator } from "../../models";

export interface IDeletePhotoValidator extends IValidator<IPhoto["_id"]> {}
