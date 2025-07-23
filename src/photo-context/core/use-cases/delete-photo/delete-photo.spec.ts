import { HttpErrorCode } from "#shared/models";
import {
  IPhotoDbTestUtils,
  IPhotoExpectsTestUtils,
  PhotoDbTestUtils,
  PhotoExpectsTestUtils,
} from "#shared/test-utils";

import { FakePhotoDataDb, FakePhotoImageDb } from "../../../adapters/";
import { IPhotoDataDb, IPhotoImageDb } from "../../../core/gateways";
import {
  IDeletePhotoParams,
  IPhoto,
  IPhotoStoredData,
  IPhotoUseCaseTestUtils,
  Photo,
} from "../../models";
import { PhotoUseCaseTestUtils } from "../test-utils";
import { DeletePhotoUseCase } from "./delete-photo";

describe(`${DeletePhotoUseCase.name}`, () => {
  let photoDataDb: IPhotoDataDb;
  let photoImageDb: IPhotoImageDb;

  let dbTestUtils: IPhotoDbTestUtils;
  let expectsTestUtils: IPhotoExpectsTestUtils;
  let useCaseTestUtils: IPhotoUseCaseTestUtils<void>;

  beforeEach(async () => {
    photoDataDb = new FakePhotoDataDb();
    photoImageDb = new FakePhotoImageDb();

    const testedUseCase = new DeletePhotoUseCase(photoDataDb, photoImageDb);

    dbTestUtils = new PhotoDbTestUtils(photoDataDb, photoImageDb);
    expectsTestUtils = new PhotoExpectsTestUtils(dbTestUtils);
    useCaseTestUtils = new PhotoUseCaseTestUtils(
      testedUseCase,
      expectsTestUtils,
    );
  });

  describe(`${DeletePhotoUseCase.prototype.execute.name}`, () => {
    const creationDate = new Date("2025-02-10");
    let photoToDelete: IPhoto;
    let useCaseParams: IDeletePhotoParams;

    beforeEach(async () => {
      photoToDelete = new Photo("photoToDelete");
      await dbTestUtils.addPhoto(photoToDelete, creationDate);

      useCaseParams = photoToDelete._id;
    });

    afterEach(async () => {
      await dbTestUtils.deletePhoto(photoToDelete._id);
    });

    it("should delete photo's data (other than image) from the photo-data db", async () => {
      const expectedStoreData = undefined;

      await useCaseTestUtils.executeTestedUseCase(useCaseParams);

      await expectsTestUtils.expectPhotoStoredDataToBe(
        useCaseParams,
        expectedStoreData,
      );
      expectsTestUtils.checkAssertions();
    });

    it("should delete photo's image the photo-image db", async () => {
      const expectedStoredImage = undefined;

      await useCaseTestUtils.executeTestedUseCase(useCaseParams);

      await expectsTestUtils.expectPhotoImageToBe(
        useCaseParams,
        expectedStoredImage,
      );
      expectsTestUtils.checkAssertions();
    });

    describe("when the deletion of photo data (other than image) fails", () => {
      beforeEach(() => {
        photoDataDb.delete = jest
          .fn()
          .mockImplementationOnce(() =>
            Promise.reject(new Error("data-deletion failed")),
          );
      });

      it(`should throw an error with status code ${HttpErrorCode.InternalServerError} (internal server error)`, async () => {
        const expectedStatus = HttpErrorCode.InternalServerError;

        await useCaseTestUtils.executeUseCaseAndExpectToThrow({
          useCaseParams: [useCaseParams],
          expectedStatus,
        });

        expectsTestUtils.checkAssertions();
      });

      it("should not delete the photo's image", async () => {
        const expectedStoredImage = photoToDelete.imageBuffer;

        try {
          await useCaseTestUtils.executeTestedUseCase(useCaseParams);
        } catch (err) {
          // do nothing
        } finally {
          await expectsTestUtils.expectPhotoImageToBe(
            useCaseParams,
            expectedStoredImage,
          );
          expectsTestUtils.checkAssertions();
        }
      });
    });

    describe("when the deletion of photo image fails", () => {
      beforeEach(() => {
        photoImageDb.delete = jest
          .fn()
          .mockImplementationOnce(() =>
            Promise.reject(new Error("image-deletion failed")),
          );
      });

      it(`should throw an error with status code ${HttpErrorCode.InternalServerError} (internal server error)`, async () => {
        const expectedStatus = HttpErrorCode.InternalServerError;

        await useCaseTestUtils.executeUseCaseAndExpectToThrow({
          useCaseParams: [useCaseParams],
          expectedStatus,
        });

        expectsTestUtils.checkAssertions();
      });

      it("should not delete photo's data in photo-data db", async () => {
        const expectedPhotoStoredData: IPhotoStoredData =
          getExpectedPhotoDataStored(photoToDelete);
        expectedPhotoStoredData.imageUrl = await photoImageDb.getUrl(
          photoToDelete._id,
        );
        expectedPhotoStoredData.manifest = {
          creation: creationDate,
          lastUpdate: creationDate,
        };
        try {
          await useCaseTestUtils.executeTestedUseCase(useCaseParams);
        } catch (err) {
          // do nothing
        } finally {
          await expectsTestUtils.expectPhotoStoredDataToBe(
            useCaseParams,
            expectedPhotoStoredData,
          );
          expectsTestUtils.checkAssertions();
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
