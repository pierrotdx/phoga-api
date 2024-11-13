import {
  FakePhotoImageDb,
  FakePhotoMetadataDb,
  dumbPhotoGenerator,
} from "@adapters";
import { AssertionsCounter, IAssertionsCounter, sharedTestUtils } from "@utils";

import { DeletePhoto } from "./delete-photo";
import { DeletePhotoTestUtils } from "./delete-photo.test-utils";

describe(`${DeletePhoto.name}`, () => {
  const photoMetadataDb = new FakePhotoMetadataDb();
  const photoImageDb = new FakePhotoImageDb();
  const testUtils = new DeletePhotoTestUtils(photoMetadataDb, photoImageDb);
  let deletePhoto: DeletePhoto;
  let assertionsCounter: IAssertionsCounter;
  const photo = dumbPhotoGenerator.generatePhoto();

  beforeEach(async () => {
    deletePhoto = new DeletePhoto(
      testUtils.photoMetadataDb,
      testUtils.photoImageDb,
    );
    await testUtils.insertPhotoInDbs(photo);
    assertionsCounter = new AssertionsCounter();
  });

  afterEach(async () => {
    await testUtils.deletePhotoIfNecessary(photo._id);
  });

  describe(`${DeletePhoto.prototype.execute.name}`, () => {
    it("should delete photo's metadata and image from their respective DBs", async () => {
      const dbPhotoBefore = await testUtils.getPhotoFromDb(photo._id);
      await deletePhoto.execute(photo._id);
      expect(dbPhotoBefore).toEqual(photo);
      assertionsCounter.increase();
      await testUtils.expectPhotoToBeDeletedFromDbs(
        photo._id,
        assertionsCounter,
      );
      assertionsCounter.checkAssertions();
    });

    it("should not delete metadata if image deletion failed", async () => {
      const assertionsCounter = new AssertionsCounter();
      testUtils.photoImageDb.delete = jest
        .fn()
        .mockImplementationOnce(() => Promise.reject("image-deletion failed"));
      await sharedTestUtils.expectRejection({
        fnExpectedToReject: deletePhoto.execute,
        fnParams: [photo._id],
        assertionsCounter,
      });
      await testUtils.expectMetadataNotToBeDeleted(photo, assertionsCounter);
      assertionsCounter.checkAssertions();
    });
  });
});
