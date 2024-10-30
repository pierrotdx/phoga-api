import { dumbPhotoGenerator } from "@adapters";
import { AssertionsCounter, IAssertionsCounter, sharedTestUtils } from "@utils";

import { FakePhotoImageDb, FakePhotoMetadataDb } from "../../../adapters";
import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { DeletePhoto } from "./delete-photo";
import { DeletePhotoTestUtils } from "./delete-photo.test-utils";

describe("delete-photo use case", () => {
  let deletePhoto: DeletePhoto;
  let imageDb: IPhotoImageDb;
  let metadataDb: IPhotoMetadataDb;
  let testUtils: DeletePhotoTestUtils;
  let assertionsCounter: IAssertionsCounter;
  const photo = dumbPhotoGenerator.generatePhoto();

  beforeEach(async () => {
    metadataDb = new FakePhotoMetadataDb();
    imageDb = new FakePhotoImageDb();
    testUtils = new DeletePhotoTestUtils({ metadataDb, imageDb });
    assertionsCounter = new AssertionsCounter();
    deletePhoto = new DeletePhoto(metadataDb, imageDb);
    await testUtils.insertPhotoInDbs(photo);
  });

  afterEach(async () => {
    await testUtils.deletePhotoIfNecessary(photo._id);
  });

  describe("photo metadata", () => {
    it("should be deleted from db", async () => {
      const dbMetadataBeforeDelete = await testUtils.getPhotoMetadataFromDb(
        photo._id,
      );

      await deletePhoto.execute(photo._id);

      await testUtils.expectMetadataToBeDeletedFromDb(
        dbMetadataBeforeDelete,
        photo,
        assertionsCounter,
      );
      assertionsCounter.checkAssertions();
    });

    it("should not be deleted if image-photo deletion failed", async () => {
      const assertionsCounter = new AssertionsCounter();
      imageDb.delete = jest
        .fn()
        .mockImplementationOnce(() => Promise.reject("image-deletion failed"));

      await sharedTestUtils.expectRejection({
        asyncFn: deletePhoto.execute,
        fnParams: [photo._id],
        assertionsCounter,
      });
      await testUtils.expectMetadataNotToBeDeleted(photo, assertionsCounter);
      assertionsCounter.checkAssertions();
    });
  });

  describe("photo image", () => {
    it("should be deleted from db", async () => {
      const dbImageBeforeDelete = await imageDb.getById(photo._id);
      await deletePhoto.execute(photo._id);
      await testUtils.expectImageToBeDeletedFromDb(
        dbImageBeforeDelete,
        photo,
        assertionsCounter,
      );
      assertionsCounter.checkAssertions();
    });
  });
});
