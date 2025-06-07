import { ISearchResult, IUseCase } from "#shared/models";

import { IPhoto } from "./photo";

export interface IAddPhotoUseCase extends IUseCase<void> {}
export interface IGetPhotoUseCase extends IUseCase<IPhoto> {}
export interface IDeletePhotoUseCase extends IUseCase<void> {}
export interface ISearchPhotoUseCase extends IUseCase<ISearchResult<IPhoto>> {}
export interface IReplacePhotoUseCase extends IUseCase<void> {}
