import { IAssertionsCounter } from "#shared/assertions-counter";

import { IPhotoMetadataDb } from "../gateways";
import { IPhoto } from "../models";

export class PhotoMetadataTestUtils {
  constructor(private readonly photoMetadataDb: IPhotoMetadataDb) {}

  async expectPhotoMetadataToBeInDb(
    photo: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    const dbMetadata = await this.photoMetadataDb.getById(photo._id);
    this.expectMatchingPhotosMetadata(
      photo.metadata,
      dbMetadata,
      assertionsCounter,
    );
  }

  expectMatchingPhotosMetadata(
    photoMetadata1: IPhoto["metadata"],
    photoMetadata2: IPhoto["metadata"],
    assertionsCounter: IAssertionsCounter,
  ): void {
    expect(photoMetadata1).toEqual(photoMetadata2);
    assertionsCounter.increase();
  }

  async expectMetadataNotToBeInDb(
    id: IPhoto["_id"],
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    const dbMetadata = await this.photoMetadataDb.getById(id);
    expect(dbMetadata).toBeUndefined();
    assertionsCounter.increase();
  }

  async getPhotoMetadataDoc(id: IPhoto["_id"]): Promise<IPhoto["metadata"]> {
    return await this.photoMetadataDb.getById(id);
  }

  async deletePhotoMetadataDoc(id: IPhoto["_id"]): Promise<void> {
    await this.photoMetadataDb.delete(id);
  }

  async insertPhotoMetadataDoc(photo: IPhoto): Promise<void> {
    if (photo.metadata) {
      await this.photoMetadataDb.insert(photo);
    }
  }
}
