import { ISearchResult } from "#shared/models";

import { IPhotoDataDb } from "../../gateways";
import { IPhoto, ISearchPhotoParams, ISearchPhotoUseCase } from "../../models";
import { fromPhotoStoredDataToPhoto } from "../../utils";

export class SearchPhotoUseCase implements ISearchPhotoUseCase {
  constructor(private readonly photoDataDb: IPhotoDataDb) {}

  async execute(
    searchPhotoParams: ISearchPhotoParams,
  ): Promise<ISearchResult<IPhoto>> {
    const searchResult = await this.searchPhotos(searchPhotoParams);
    const formattedSearchResult: ISearchResult<IPhoto> = {
      ...searchResult,
      hits: searchResult.hits.map((p) => fromPhotoStoredDataToPhoto(p)),
    };
    return formattedSearchResult;
  }

  private async searchPhotos(
    searchPhotoParams: ISearchPhotoParams,
  ): Promise<ISearchResult<IPhoto>> {
    const { filter, options } = { ...searchPhotoParams };
    const searchResult = await this.photoDataDb.find({
      filter,
      rendering: options,
    });
    return searchResult;
  }
}
