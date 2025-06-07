import { ISearchResult } from "#shared/models";

import { fromPhotoStoredDataToPhotoData } from "../../";
import { IPhotoDataDb, IPhotoImageDb } from "../../gateways";
import {
  IPhoto,
  IPhotoStoredData,
  ISearchPhotoParams,
  ISearchPhotoUseCase,
  Photo,
} from "../../models";

export class SearchPhotoUseCase implements ISearchPhotoUseCase {
  constructor(
    private readonly photoDataDb: IPhotoDataDb,
    private readonly photoImageDb: IPhotoImageDb,
  ) {}

  async execute(
    searchPhotoParams: ISearchPhotoParams,
  ): Promise<ISearchResult<IPhoto>> {
    try {
      const searchResult =
        await this.searchPhotosWithoutImages(searchPhotoParams);
      if (!searchPhotoParams?.options?.excludeImages) {
        await this.fetchImages(searchResult);
      }
      return searchResult;
    } catch (err) {
      throw err;
    }
  }

  private async searchPhotosWithoutImages(
    searchPhotoParams: ISearchPhotoParams,
  ): Promise<ISearchResult<IPhoto>> {
    const { filter, options } = { ...searchPhotoParams };
    const rawSearchResult = await this.photoDataDb.find({
      filter,
      rendering: options?.rendering,
    });
    const formattedSearchResult = {
      ...rawSearchResult,
      hits: rawSearchResult.hits.map(
        this.fromPhotoStoredDataToPhotoWithoutImage,
      ),
    };
    return formattedSearchResult;
  }

  private fromPhotoStoredDataToPhotoWithoutImage = (
    photosStoredData: IPhotoStoredData,
  ): IPhoto => {
    const photoData = fromPhotoStoredDataToPhotoData(photosStoredData);
    return new Photo(photoData._id, { photoData });
  };

  private async fetchImages(
    searchResult: ISearchResult<IPhoto>,
  ): Promise<void> {
    const photoIds = searchResult.hits.map((photo) => photo._id);
    const imageBuffersById = await this.photoImageDb.getByIds(photoIds);
    searchResult.hits.forEach((p) => {
      const imageBuffer = imageBuffersById[p._id];
      if (imageBuffer) {
        p.imageBuffer = imageBuffer;
      }
    });
  }
}
