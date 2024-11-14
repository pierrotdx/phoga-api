import { DbsTestUtils, IAssertionsCounter } from "@shared";

import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { IPhoto } from "../../models";

export class DeletePhotoTestUtils {
  private dbsTestUtils: DbsTestUtils;

  constructor(
    public readonly photoMetadataDb: IPhotoMetadataDb,
    public readonly photoImageDb: IPhotoImageDb,
  ) {
    this.testUtilsFactory();
  }

  private testUtilsFactory() {
    this.dbsTestUtils = new DbsTestUtils(
      this.photoMetadataDb,
      this.photoImageDb,
    );
  }

  async insertPhotoInDbs(photo: IPhoto): Promise<void> {
    return await this.dbsTestUtils.insertPhotoInDbs(photo);
  }

  async getPhotoFromDb(id: IPhoto["_id"]): Promise<IPhoto> {
    return await this.dbsTestUtils.getPhotoFromDb(id);
  }

  async deletePhotoIfNecessary(id: IPhoto["_id"]): Promise<void> {
    return await this.dbsTestUtils.deletePhotoIfNecessary(id);
  }

  async getPhotoMetadataFromDb(id: IPhoto["_id"]): Promise<IPhoto["metadata"]> {
    return await this.dbsTestUtils.getPhotoMetadataFromDb(id);
  }

  async expectPhotoToBeDeletedFromDbs(
    id: IPhoto["_id"],
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    const photo = await this.getPhotoFromDb(id);
    expect(photo.imageBuffer).toBeUndefined();
    expect(photo.metadata).toBeUndefined();
    assertionsCounter.increase(2);
  }

  async expectMetadataNotToBeDeleted(
    photo: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    const metadataFromDb = await this.dbsTestUtils.getPhotoMetadataFromDb(
      photo._id,
    );
    expect(metadataFromDb).toBeDefined();
    expect(metadataFromDb).toEqual(photo.metadata);
    assertionsCounter.increase(2);
  }
}
