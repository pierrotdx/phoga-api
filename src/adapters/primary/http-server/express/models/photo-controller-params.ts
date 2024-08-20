import {
  AddPhoto,
  DeletePhoto,
  GetPhoto,
  ReplacePhoto,
} from "../../../../../business-logic";
import { IAddPhotoValidator } from "../../models/add-photo";
import { IDeletePhotoValidator } from "../../models/delete-photo";
import { IGetPhotoValidator } from "../../models/get-photo";
import { IReplacePhotoValidator } from "../../models/replace-photo";

interface IPhotoControllerParamItem<UseCase = unknown, Validator = unknown> {
  useCase: UseCase;
  validator: Validator;
}

export interface IPhotoControllerParams {
  getPhoto: IPhotoControllerParamItem<GetPhoto, IGetPhotoValidator>;
  addPhoto: IPhotoControllerParamItem<AddPhoto, IAddPhotoValidator>;
  replacePhoto: IPhotoControllerParamItem<ReplacePhoto, IReplacePhotoValidator>;
  deletePhoto: IPhotoControllerParamItem<DeletePhoto, IDeletePhotoValidator>;
}
