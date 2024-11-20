import { IAssertionsCounter } from "@assertions-counter";
import { IPhoto, IPhotoMetadataDb } from "@domain";

export class PhotoMetadataTestUtils {
  constructor(private readonly db: IPhotoMetadataDb) {}

  async expectPhotoMetadataToBeInDb(
    photo: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    const dbMetadata = await this.db.getById(photo._id);
    expect(dbMetadata).toEqual(photo.metadata);
    assertionsCounter.increase();
  }

  async expectMetadataNotToBeInDb(
    id: IPhoto["_id"],
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    const dbMetadata = await this.db.getById(id);
    expect(dbMetadata).toBeUndefined();
    assertionsCounter.increase();
  }
}
