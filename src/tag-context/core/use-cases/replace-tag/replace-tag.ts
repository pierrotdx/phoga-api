import { IPhotoDataDb, IPhotoStoredData } from "#photo-context";

import { ITagDb } from "../../gateways";
import { IReplaceTagUseCase, ITag } from "../../models";

export class ReplaceTagUseCase implements IReplaceTagUseCase {
  constructor(
    private readonly tagDb: ITagDb,
    private readonly photoDataDb: IPhotoDataDb,
  ) {}

  async execute(tag: ITag): Promise<void> {
    await this.tagDb.replace(tag);
    await this.replaceTagInPhotos(tag);
  }

  private async replaceTagInPhotos(tag: ITag): Promise<void> {
    const photos = await this.getPhotosToUpdate(tag._id);
    photos.forEach((photo) => this.updateTagInPhoto(photo, tag));
    await this.insertPhotos(photos);
  }

  private async getPhotosToUpdate(
    tagId: ITag["_id"],
  ): Promise<IPhotoStoredData[]> {
    const searchResult = await this.photoDataDb.find({
      filter: { tagId },
    });
    return searchResult.hits;
  }

  private updateTagInPhoto(photo: IPhotoStoredData, tag: ITag): void {
    const newTags = photo.tags.map((t) => {
      if (t._id === tag._id) {
        return tag;
      }
      return t;
    });
    photo.tags = newTags;
  }

  private async insertPhotos(photos: IPhotoStoredData[]): Promise<void> {
    const insertPhotos$ = photos.map(
      async (p) => await this.photoDataDb.insert(p),
    );
    await Promise.all(insertPhotos$);
  }
}
