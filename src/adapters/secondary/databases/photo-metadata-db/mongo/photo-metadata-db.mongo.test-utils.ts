import { omit } from "ramda";

import { IPhoto } from "@business-logic";
import { DbsTestUtils, IAssertionsCounter, IDbsTestUtilsParams } from "@utils";

import { MongoStore } from "../../mongo";

type TDoc = MongoStore<IPhoto["metadata"]>;

export class PhotoMetadataDbMongoTestUtils extends DbsTestUtils {
  constructor(dbsTestUtilsParams: IDbsTestUtilsParams) {
    super(dbsTestUtilsParams);
  }

  async getDocFromDb(_id: IPhoto["_id"]): Promise<TDoc> {
    const metadata = await this.getPhotoMetadataFromDb(_id);
    if (metadata) {
      return { _id, ...metadata };
    }
  }

  expectMatchingPhotos(
    expectedPhoto: IPhoto,
    result: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): void {
    expect(result._id).toEqual(expectedPhoto._id);
    expect(result.metadata).toEqual(expectedPhoto.metadata);
    assertionsCounter.increase(2);
  }

  expectMatchingPhotoArrays(
    expectedPhotos: IPhoto[],
    result: IPhoto[],
    assertionsCounter: IAssertionsCounter,
  ): void {
    expect(result.length).toBe(expectedPhotos.length);
    assertionsCounter.increase();

    const expectedPhotosWithoutImage = expectedPhotos.map((p) =>
      omit(["imageBuffer"], p),
    );

    result.forEach((photo) => {
      expect(expectedPhotosWithoutImage).toContainEqual(photo);
      assertionsCounter.increase();
    });
  }

  async expectDocToHaveBeenInserted(
    docBefore: TDoc,
    docAfter: TDoc,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    expect(docBefore).toBeUndefined();
    expect(docAfter).toBeDefined();
    assertionsCounter.increase(2);
  }

  expectDocToMatchExpectedPhoto(
    expectedPhoto: IPhoto,
    doc: TDoc,
    assertionsCounter: IAssertionsCounter,
  ): void {
    expect(doc._id).toBe(expectedPhoto._id);
    const docMetadata = omit(["_id"], doc);
    expect(docMetadata).toEqual(expectedPhoto.metadata);
    assertionsCounter.increase(2);
  }
}
