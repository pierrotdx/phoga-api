import { IRendering, ISearchResult } from "#shared/models";

import { IPhoto, IPhotoStoredData, ISearchPhotoFilter } from "../..";

export interface IPhotoDataDb {
  insert: (photo: IPhotoStoredData) => Promise<void>;
  getById: (id: IPhoto["_id"]) => Promise<IPhotoStoredData | undefined>;
  delete: (id: IPhoto["_id"]) => Promise<void>;
  replace: (photo: IPhotoStoredData) => Promise<void>;
  find: ({
    filter,
    rendering,
  }?: {
    filter?: ISearchPhotoFilter;
    rendering?: IRendering;
  }) => Promise<ISearchResult<IPhotoStoredData>>;
}
