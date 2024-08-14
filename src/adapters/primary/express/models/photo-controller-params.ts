import {
  AddPhoto,
  DeletePhoto,
  GetPhoto,
  ReplacePhoto,
} from "../../../../business-logic";
import { IAddPhotoValidator } from "./add-photo";
import { IDeletePhotoValidator } from "./delete-photo";
import { IGetPhotoValidator } from "./get-photo";
import { IReplacePhotoValidator } from "./replace-photo";

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
