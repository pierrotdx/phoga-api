import { HttpErrorCode } from "#shared/models";

import {
  FakePhotoDataDb,
  FakePhotoImageDb,
  dumbPhotoGenerator,
} from "../../../adapters/";
import { IPhotoDataDb, IPhotoImageDb } from "../../../core/gateways";
import { PhotoTestUtils } from "../../../core/test-utils";
import {
  IDeletePhotoParams,
  IDeletePhotoUseCase,
  IPhoto,
  IPhotoStoredData,
} from "../../models";
import { DeletePhotoUseCase } from "./delete-photo";

describe(`${DeletePhotoUseCase.name}`, () => {
  let photoDataDb: IPhotoDataDb;
  let photoImageDb: IPhotoImageDb;

  let testedUseCase: IDeletePhotoUseCase;

  let testUtils: PhotoTestUtils;

  beforeEach(async () => {
    photoDataDb = new FakePhotoDataDb();
    photoImageDb = new FakePhotoImageDb();

    testedUseCase = new DeletePhotoUseCase(photoDataDb, photoImageDb);

    testUtils = new PhotoTestUtils(photoDataDb, photoImageDb, testedUseCase);
  });

  describe(`${DeletePhotoUseCase.prototype.execute.name}`, () => {
    let photoToDelete: IPhoto;
    let useCaseParams: IDeletePhotoParams;

    beforeEach(async () => {
      photoToDelete = await dumbPhotoGenerator.generatePhoto();
      await testUtils.insertPhotoInDbs(photoToDelete);

      useCaseParams = photoToDelete._id;
    });

    afterEach(async () => {
      await testUtils.deletePhotoFromDb(photoToDelete._id);
    });

    it("should delete photo\'s data (other than image) from the photo-data db", async () => {
      const expectedStoreData = undefined;

      await testUtils.executeTestedUseCase(useCaseParams);

      await testUtils.expectPhotoStoredDataToBe(
        useCaseParams,
        expectedStoreData,
      );
      testUtils.checkAssertions();
    });

    it("should delete photo's image the photo-image db", async () => {
      const expectedStoredImage = undefined;

      await testUtils.executeTestedUseCase(useCaseParams);

      await testUtils.expectPhotoStoredImageToBe(
        useCaseParams,
        expectedStoredImage,
      );
      testUtils.checkAssertions();
    });

    describe("when the deletion of photo data (other than image) fails", () => {
      beforeEach(() => {
        photoDataDb.delete = jest
          .fn()
          .mockImplementationOnce(() => Promise.reject("data-deletion failed"));
      });

      it(`should throw an error with status code ${HttpErrorCode.InternalServerError} (internal server error)`, async () => {
        const expectedStatus = HttpErrorCode.InternalServerError;

        await testUtils.executeUseCaseAndExpectToThrow({
          useCaseParams: [useCaseParams],
          expectedStatus,
        });

        testUtils.checkAssertions();
      });

      it("should not delete the photo's image", async () => {
        const expectedStoredImage = photoToDelete.imageBuffer;

        try {
          await testUtils.executeTestedUseCase(useCaseParams);
        } catch (err) {
        } finally {
          await testUtils.expectPhotoStoredImageToBe(
            useCaseParams,
            expectedStoredImage,
          );
          testUtils.checkAssertions();
        }
      });
    });

    describe("when the deletion of photo image fails", () => {
      beforeEach(() => {
        photoImageDb.delete = jest
          .fn()
          .mockImplementationOnce(() =>
            Promise.reject("image-deletion failed"),
          );
      });

      it(`should throw an error with status code ${HttpErrorCode.InternalServerError} (internal server error)`, async () => {
        const expectedStatus = HttpErrorCode.InternalServerError;

        await testUtils.executeUseCaseAndExpectToThrow({
          useCaseParams: [useCaseParams],
          expectedStatus,
        });

        testUtils.checkAssertions();
      });

      it("should not delete photo's data in photo-data db", async () => {
        const expectedPhotoStoredData: IPhotoStoredData =
          getExpectedPhotoDataStored(photoToDelete);
        try {
          await testUtils.executeTestedUseCase(useCaseParams);
        } catch (err) {
        } finally {
          await testUtils.expectPhotoStoredDataToBe(
            useCaseParams,
            expectedPhotoStoredData,
          );
          testUtils.checkAssertions();
        }
      });
    });
  });
});

function getExpectedPhotoDataStored(photo: IPhoto): IPhotoStoredData {
  const photoStoredData: IPhotoStoredData = {
    _id: photo._id,
    metadata: photo.metadata,
  };
  return photoStoredData;
}
