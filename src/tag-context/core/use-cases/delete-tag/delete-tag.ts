import { IPhotoDataDb, IPhotoStoredData } from "#photo-context";

import { ITagDb } from "../../gateways";
import { IDeleteTagUseCase, ITag } from "../../models";

export class DeleteTagUseCase implements IDeleteTagUseCase {
  constructor(
    private readonly tagDb: ITagDb,
    private readonly photoDataDb: IPhotoDataDb,
  ) {}

  async execute(id: ITag["_id"]): Promise<void> {
    await this.tagDb.delete(id);
    await this.deleteTagInPhotos(id);
  }

  private async deleteTagInPhotos(id: ITag["_id"]): Promise<void> {
    const photos = await this.photoDataDb.find({ filter: { tagId: id } });
    photos.forEach((p) => this.removeTagFromPhoto(p, id));
    await this.insertPhotos(photos);
  }

  private removeTagFromPhoto(
    photo: IPhotoStoredData,
    tagId: ITag["_id"],
  ): void {
    const newTags = photo.tags.filter((t) => t._id !== tagId);
    photo.tags = newTags;
  }

  private async insertPhotos(photos: IPhotoStoredData[]): Promise<void> {
    const insertPhotos$ = photos.map(
      async (p) => await this.photoDataDb.insert(p),
    );
    await Promise.all(insertPhotos$);
  }
}
