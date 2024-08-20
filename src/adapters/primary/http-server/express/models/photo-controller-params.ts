import {
  AddPhoto,
  DeletePhoto,
  GetPhoto,
  ReplacePhoto,
} from "../../../../../business-logic";
import {
  IAddPhotoValidator,
  IDeletePhotoValidator,
  IGetPhotoValidator,
  IReplacePhotoValidator,
} from "../../models";

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
