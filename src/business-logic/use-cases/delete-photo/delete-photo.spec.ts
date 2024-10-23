import { dumbPhotoGenerator } from "@adapters";
import { Counter, sharedTestUtils } from "@utils";

import { FakePhotoImageDb, FakePhotoMetadataDb } from "../../../adapters";
import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { DeletePhoto } from "./delete-photo";
import { DeletePhotoTestUtils } from "./delete-photo.test-utils";

describe("delete-photo use case", () => {
  let deletePhoto: DeletePhoto;
  let imageDb: IPhotoImageDb;
  let metadataDb: IPhotoMetadataDb;
  let deletePhotoTestUtils: DeletePhotoTestUtils;
  const photo = dumbPhotoGenerator.generate();

  beforeEach(async () => {
    metadataDb = new FakePhotoMetadataDb();
    imageDb = new FakePhotoImageDb();
    deletePhotoTestUtils = new DeletePhotoTestUtils(metadataDb, imageDb);
    deletePhoto = new DeletePhoto(metadataDb, imageDb);
    await deletePhotoTestUtils.insertPhotoInDbs(photo);
  });

  afterEach(async () => {
    await deletePhotoTestUtils.deletePhotoIfNecessary(photo._id);
  });

  describe("photo metadata", () => {
    it("should be deleted from db", async () => {
      const dbMetadataBeforeDelete =
        await deletePhotoTestUtils.getPhotoMetadataFromDb(photo._id);

      await deletePhoto.execute(photo._id);

      await deletePhotoTestUtils.expectMetadataToBeDeletedFromDb(
        dbMetadataBeforeDelete,
        photo,
      );
    });

    it("should not be deleted if image-photo deletion failed", async () => {
      const assertionsCounter = new Counter();
      imageDb.delete = jest
        .fn()
        .mockImplementationOnce(() => Promise.reject("image-deletion failed"));

      await sharedTestUtils.expectRejection({
        asyncFn: deletePhoto.execute,
        fnParams: [photo._id],
        assertionsCounter,
      });
      await deletePhotoTestUtils.expectMetadataNotToBeDeleted(
        photo,
        assertionsCounter,
      );
      sharedTestUtils.checkAssertionsCount(assertionsCounter);
    });
  });

  describe("photo image", () => {
    it("should be deleted from db", async () => {
      const dbImageBeforeDelete = await imageDb.getById(photo._id);
      await deletePhoto.execute(photo._id);
      await deletePhotoTestUtils.expectImageToBeDeletedFromDb(
        dbImageBeforeDelete,
        photo,
      );
    });
  });
});
