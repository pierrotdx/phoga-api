import {
  FakePhotoImageDb,
  FakePhotoMetadataDb,
  dumbPhotoGenerator,
} from "../../../adapters/";
import { IPhoto } from "../../models";
import { DeletePhotoUseCase } from "./delete-photo";
import { DeletePhotoTestUtils } from "./delete-photo.test-utils";

describe(`${DeletePhotoUseCase.name}`, () => {
  const photoMetadataDb = new FakePhotoMetadataDb();
  const photoImageDb = new FakePhotoImageDb();
  let testUtils: DeletePhotoTestUtils;

  beforeEach(async () => {
    testUtils = new DeletePhotoTestUtils(photoMetadataDb, photoImageDb);
  });

  describe(`${DeletePhotoUseCase.prototype.execute.name}`, () => {
    let photo: IPhoto;

    beforeEach(async () => {
      photo = await dumbPhotoGenerator.generatePhoto();
      await testUtils.insertPhotoInDbs(photo);
    });

    afterEach(async () => {
      await testUtils.deletePhotoIfNecessary(photo._id);
    });

    it("should delete photo's metadata and image from their respective DBs", async () => {
      await testUtils.executeTestedUseCase(photo._id);

      await testUtils.expectPhotoToBeDeletedFromDbs(photo._id);
    });

    it("should not delete metadata if image deletion failed", async () => {
      testUtils.photoImageDb.delete = jest
        .fn()
        .mockImplementationOnce(() => Promise.reject("image-deletion failed"));

      await testUtils.executeTestedUseCaseAndExpectToThrow(photo._id);
    });
  });
});
