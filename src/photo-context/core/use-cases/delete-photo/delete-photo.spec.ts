import {
  FakePhotoImageDb,
  FakePhotoMetadataDb,
  dumbPhotoGenerator,
} from "../../../adapters/";
import { IPhotoImageDb, IPhotoMetadataDb } from "../../../core/gateways";
import { PhotoTestUtils } from "../../../core/test-utils";
import { IDeletePhotoUseCase, IPhoto } from "../../models";
import { DeletePhotoUseCase } from "./delete-photo";

describe(`${DeletePhotoUseCase.name}`, () => {
  let photoMetadataDb: IPhotoMetadataDb;
  let photoImageDb: IPhotoImageDb;

  let testedUseCase: IDeletePhotoUseCase;

  let testUtils: PhotoTestUtils;

  beforeEach(async () => {
    photoMetadataDb = new FakePhotoMetadataDb();
    photoImageDb = new FakePhotoImageDb();

    testedUseCase = new DeletePhotoUseCase(photoMetadataDb, photoImageDb);

    testUtils = new PhotoTestUtils(
      photoMetadataDb,
      photoImageDb,
      testedUseCase,
    );
  });

  describe(`${DeletePhotoUseCase.prototype.execute.name}`, () => {
    let photo: IPhoto;

    beforeEach(async () => {
      photo = await dumbPhotoGenerator.generatePhoto();
      await testUtils.insertPhotoInDb(photo);
    });

    afterEach(async () => {
      await testUtils.deletePhotoFromDb(photo._id);
    });

    it("should delete photo's metadata and image from their respective DBs", async () => {
      await testUtils.executeTestedUseCase(photo._id);

      await testUtils.expectPhotoToBeDeletedFromDbs(photo._id);
      testUtils.checkAssertions();
    });

    it("should not delete metadata if image deletion failed", async () => {
      photoImageDb.delete = jest
        .fn()
        .mockImplementationOnce(() => Promise.reject("image-deletion failed"));

      await testUtils.executeUseCaseAndExpectToThrow(photo._id);
      testUtils.checkAssertions();
    });
  });
});
