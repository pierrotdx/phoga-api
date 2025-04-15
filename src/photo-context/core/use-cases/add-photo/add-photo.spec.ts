import { HttpErrorCode } from "#shared/models";

import {
  FakePhotoDataDb,
  FakePhotoImageDb,
  dumbPhotoGenerator,
} from "../../../adapters/";
import { IPhotoDataDb, IPhotoImageDb, PhotoTestUtils } from "../../../core";
import {
  IAddPhotoParams,
  IAddPhotoUseCase,
  IPhoto,
  IPhotoStoredData,
} from "../../models";
import { AddPhotoUseCase } from "./add-photo";

describe(`${AddPhotoUseCase.name}`, () => {
  let photoDataDb: IPhotoDataDb;
  let photoImageDb: IPhotoImageDb;

  let testedUseCase: IAddPhotoUseCase;

  let testUtils: PhotoTestUtils<void>;

  beforeEach(async () => {
    photoDataDb = new FakePhotoDataDb();
    photoImageDb = new FakePhotoImageDb();

    testedUseCase = new AddPhotoUseCase(photoDataDb, photoImageDb);

    testUtils = new PhotoTestUtils(photoDataDb, photoImageDb, testedUseCase);
  });

  describe(`${AddPhotoUseCase.prototype.execute.name}`, () => {
    let useCaseParams: IAddPhotoParams;

    describe("when there is no image to upload", () => {
      beforeEach(async () => {
        const photoWithoutImage = await dumbPhotoGenerator.generatePhoto();
        delete photoWithoutImage.imageBuffer;
        useCaseParams = photoWithoutImage;
      });

      it(`should throw an error with status code ${HttpErrorCode.BadRequest} (bad request)`, async () => {
        const expectedStatus = HttpErrorCode.BadRequest;
        await testUtils.executeUseCaseAndExpectToThrow({
          useCaseParams: [useCaseParams],
          expectedStatus,
        });
        testUtils.checkAssertions();
      });

      it(`should not upload anything to the photo-data db`, async () => {
        try {
          await testUtils.executeTestedUseCase(useCaseParams);
        } catch (err) {
        } finally {
          await testUtils.expectPhotoStoredDataToBe(
            useCaseParams._id,
            undefined,
          );
          testUtils.checkAssertions();
        }
      });
    });

    describe("when there is an image to upload", () => {
      beforeEach(async () => {
        useCaseParams = await dumbPhotoGenerator.generatePhoto();
      });

      it("should upload the image to the photo-image db", async () => {
        await testUtils.executeTestedUseCase(useCaseParams);

        await testUtils.expectPhotoStoredImageToBe(
          useCaseParams._id,
          useCaseParams.imageBuffer,
        );
        testUtils.checkAssertions();
      });

      it("should upload the data (other than image) to the photo-data db", async () => {
        const expectedStoredData: IPhotoStoredData = {
          _id: useCaseParams._id,
          metadata: useCaseParams.metadata,
        };

        console.log("useCaseParams", useCaseParams);
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
