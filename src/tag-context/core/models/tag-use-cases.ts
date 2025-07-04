import { ISearchResult, IUseCase } from "#shared/models";

import { ITag } from "./tag";

export interface IAddTagUseCase extends IUseCase<void> {}
export interface IGetTagUseCase extends IUseCase<ITag> {}
export interface IDeleteTagUseCase extends IUseCase<void> {}
export interface IReplaceTagUseCase extends IUseCase<void> {}
export interface ISearchTagUseCase extends IUseCase<ISearchResult<ITag>> {}
