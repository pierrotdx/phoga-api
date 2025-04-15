import { HttpErrorCode } from "#shared/models";

import {
  FakePhotoDataDb,
  FakePhotoImageDb,
  dumbPhotoGenerator,
} from "../../../adapters/";
import {
  AddPhotoUseCase,
  IPhotoDataDb,
  IPhotoImageDb,
  PhotoTestUtils,
} from "../../../core";
import {
  IPhoto,
  IPhotoStoredData,
  IReplacePhotoParams,
  IReplacePhotoUseCase,
} from "../../models";
import { ReplacePhotoUseCase } from "./replace-photo";

describe(`${ReplacePhotoUseCase.name}`, () => {
  let photoDataDb: IPhotoDataDb;
  let photoImageDb: IPhotoImageDb;

  let testedUseCase: IReplacePhotoUseCase;

  let testUtils: PhotoTestUtils;

  beforeEach(async () => {
    photoDataDb = new FakePhotoDataDb();
    photoImageDb = new FakePhotoImageDb();

    testedUseCase = new ReplacePhotoUseCase(photoDataDb, photoImageDb);

    testUtils = new PhotoTestUtils(photoDataDb, photoImageDb, testedUseCase);
  });

  describe(`${ReplacePhotoUseCase.prototype.execute.name}`, () => {
    let useCaseParams: IReplacePhotoParams;

    afterEach(() => {
      useCaseParams = undefined;
    });

    describe("when there is no photo to replace", () => {
      beforeEach(async () => {
        const newPhoto = await dumbPhotoGenerator.generatePhoto();
        useCaseParams = newPhoto;
      });

      it(`should throw an error with status code ${HttpErrorCode.NotFound} (not found)`, async () => {
        const expectedStatus = HttpErrorCode.NotFound;

        await testUtils.executeUseCaseAndExpectToThrow({
          useCaseParams: [useCaseParams],
          expectedStatus,
        });

        testUtils.checkAssertions();
      });
    });

    describe("when there is a photo to replace", () => {
      let photoToReplace: IPhoto;

      beforeEach(async () => {
        photoToReplace = await dumbPhotoGenerator.generatePhoto();
        await testUtils.insertPhotoInDbs(photoToReplace);
      });

      afterEach(async () => {
        await testUtils.deletePhotoFromDb(photoToReplace._id);
      });

      describe("when there is no image in the new photo", () => {
        beforeEach(async () => {
          const newPhotoWithoutImage = await dumbPhotoGenerator.generatePhoto({
            _id: photoToReplace._id,
          });
          delete newPhotoWithoutImage.imageBuffer;

          useCaseParams = newPhotoWithoutImage;
        });

        it(`should throw an error with status code ${HttpErrorCode.BadRequest} (bad request)`, async () => {
          const expectedStatus = HttpErrorCode.BadRequest;

          await testUtils.executeUseCaseAndExpectToThrow({
            useCaseParams: [useCaseParams],
            expectedStatus,
          });

          testUtils.checkAssertions();
        });

        it("should not update the data (other than image) in the photo-data db", async () => {
          const expectedStoreData: IPhotoStoredData =
            getExpectedPhotoDataStored(photoToReplace);

          try {
            await testUtils.executeTestedUseCase(useCaseParams);
          } catch (err) {
          } finally {
            await testUtils.expectPhotoStoredDataToBe(
              photoToReplace._id,
              expectedStoreData,
            );
            testUtils.checkAssertions();
          }
        });
      });

      describe("when there is an image in the new photo", () => {
        beforeEach(async () => {
          const newPhoto = await dumbPhotoGenerator.generatePhoto({
            _id: photoToReplace._id,
          });
          useCaseParams = newPhoto;
        });

        it("should replace the photo image in the photo-image db", async () => {
          const expectedPhotoImage = useCaseParams.imageBuffer;

          await testUtils.executeTestedUseCase(useCaseParams);

          await testUtils.expectPhotoStoredImageToBe(
            useCaseParams._id,
            expectedPhotoImage,
          );
          testUtils.checkAssertions();
        });

        describe("when the photo to replace had data already stored in the photo-data db", () => {
          it("should replace the data with the new one in the photo-data db", async () => {
            const expectedStoredData =
              getExpectedPhotoDataStored(useCaseParams);

            await testUtils.executeTestedUseCase(useCaseParams);

            await testUtils.expectPhotoStoredDataToBe(
              useCaseParams._id,
              expectedStoredData,
            );
            testUtils.checkAssertions();
          });
        });

        describe("when the photo to replace did non have any data stored in the photo-data db", () => {
          beforeEach(async () => {
            const newPhotoWithoutData = await dumbPhotoGenerator.generatePhoto({
              _id: photoToReplace._id,
            });
            delete newPhotoWithoutData.metadata;
            useCaseParams = newPhotoWithoutData;
          });

          it("should add the new data in the photo-data db", async () => {
            const expectedStoredData =
              getExpectedPhotoDataStored(useCaseParams);

            await testUtils.executeTestedUseCase(useCaseParams);

            await testUtils.expectPhotoStoredDataToBe(
              useCaseParams._id,
              expectedStoredData,
            );
            testUtils.checkAssertions();
          });
        });
      });
    });
  });
});

function getExpectedPhotoDataStored(
  useCaseParams: Parameters<typeof AddPhotoUseCase.prototype.execute>[0],
): IPhotoStoredData {
  const photoStoredData: IPhotoStoredData = {
    _id: useCaseParams._id,
    metadata: useCaseParams.metadata,
  };
  return photoStoredData;
}
