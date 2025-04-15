import { HttpErrorCode } from "#shared/models";
import { readFile } from "fs/promises";

import {
  FakePhotoDataDb,
  FakePhotoImageDb,
  dumbPhotoGenerator,
} from "../../../adapters/";
import { IPhotoDataDb, IPhotoImageDb } from "../../gateways";
import {
  GetPhotoField,
  IGetPhotoOptions,
  IGetPhotoParams,
  IGetPhotoUseCase,
  IPhoto,
  Photo,
} from "../../models";
import { PhotoTestUtils } from "../../test-utils";
import { GetPhotoUseCase } from "./get-photo";

describe(`${GetPhotoUseCase.name}`, () => {
  let photoDataDb: IPhotoDataDb;
  let photoImageDb: IPhotoImageDb;

  let testedUseCase: IGetPhotoUseCase;

  let testUtils: PhotoTestUtils<IPhoto>;

  beforeEach(async () => {
    photoDataDb = new FakePhotoDataDb();
    photoImageDb = new FakePhotoImageDb();

    testedUseCase = new GetPhotoUseCase(photoDataDb, photoImageDb);

    testUtils = new PhotoTestUtils(photoDataDb, photoImageDb, testedUseCase);
  });

  describe(`${GetPhotoUseCase.prototype.execute.name}`, () => {
    let useCaseParams: IGetPhotoParams;
    let photoToGet: IPhoto;

    beforeEach(async () => {
      const imageBuffer = await readFile("assets/test-img-1_536x354.jpg");
      photoToGet = await dumbPhotoGenerator.generatePhoto({ imageBuffer });

      useCaseParams = photoToGet._id;
    });

    describe("when the required photo does not have a stored image", () => {
      it(`should throw an error with status code ${HttpErrorCode.NotFound} (not found)`, async () => {
        const expectedStatus = HttpErrorCode.NotFound;

        await testUtils.executeUseCaseAndExpectToThrow({
          useCaseParams: [useCaseParams],
          expectedStatus,
        });

        testUtils.checkAssertions();
      });
    });

    describe("when the required photo has a stored image", () => {
      beforeEach(async () => {
        await testUtils.insertPhotoInDb(photoToGet);
      });

      afterEach(async () => {
        await testUtils.deletePhotoFromDb(photoToGet._id);
      });

      it("should return the required photo", async () => {
        const result = await testUtils.executeTestedUseCase(photoToGet._id);

        testUtils.expectMatchingPhotos(photoToGet, result);
        testUtils.checkAssertions();
      });

      describe("when using the `fields` option", () => {
        let options: IGetPhotoOptions = {};

        describe(`with value 'fields=[${GetPhotoField.PhotoData}]'`, () => {
          beforeEach(() => {
            options.fields = [GetPhotoField.PhotoData];
          });

          it("should return the photo with only the photo data", async () => {
            const photoData = testUtils.getPhotoData(photoToGet);
            const expectedPhoto = new Photo(photoToGet._id, { photoData });

            const result = await testUtils.executeTestedUseCase(
              useCaseParams,
              options,
            );

            testUtils.expectMatchingPhotos(expectedPhoto, result);
            testUtils.checkAssertions();
          });
        });

        describe(`with value 'fields=[${GetPhotoField.ImageBuffer}]'`, () => {
          beforeEach(() => {
            options.fields = [GetPhotoField.ImageBuffer];
          });

          it("should return the photo with only the image", async () => {
            const imageBuffer = photoToGet.imageBuffer;
            const expectedPhoto = new Photo(photoToGet._id, { imageBuffer });

            const result = await testUtils.executeTestedUseCase(
              useCaseParams,
              options,
            );

            testUtils.expectMatchingPhotos(expectedPhoto, result);
            testUtils.checkAssertions();
          });
        });
      });
    });
  });
});
