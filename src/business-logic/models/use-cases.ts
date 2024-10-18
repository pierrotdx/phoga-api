import {
  AddPhoto,
  DeletePhoto,
  GetPhoto,
  ReplacePhoto,
  SearchPhoto,
} from "../use-cases";

export interface IUseCases {
  addPhoto: AddPhoto;
  getPhoto: GetPhoto;
  deletePhoto: DeletePhoto;
  replacePhoto: ReplacePhoto;
  searchPhoto: SearchPhoto;
}
