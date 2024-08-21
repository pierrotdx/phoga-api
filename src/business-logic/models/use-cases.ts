import { AddPhoto, DeletePhoto, GetPhoto, ReplacePhoto } from "../use-cases";

export interface IUseCases {
  addPhoto: AddPhoto;
  getPhoto: GetPhoto;
  deletePhoto: DeletePhoto;
  replacePhoto: ReplacePhoto;
}
