import { HttpErrorCode } from "#shared/models";
import {
  IPhotoDbTestUtils,
  IPhotoExpectsTestUtils,
  PhotoDbTestUtils,
  PhotoExpectsTestUtils,
} from "#shared/test-utils";

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
  IPhoto,
  IPhotoUseCaseTestUtils,
  Photo,
} from "../../models";
import { PhotoUseCaseTestUtils } from "../test-utils";
import { GetPhotoUseCase } from "./get-photo";

describe(`${GetPhotoUseCase.name}`, () => {
  let photoDataDb: IPhotoDataDb;
  let photoImageDb: IPhotoImageDb;

  let dbTestUtils: IPhotoDbTestUtils;
  let expectsTestUtils: IPhotoExpectsTestUtils;
  let useCaseTestUtils: IPhotoUseCaseTestUtils<IPhoto>;

  beforeEach(async () => {
    photoDataDb = new FakePhotoDataDb();
    photoImageDb = new FakePhotoImageDb();

    const testedUseCase = new GetPhotoUseCase(photoDataDb, photoImageDb);

    dbTestUtils = new PhotoDbTestUtils(photoDataDb, photoImageDb);
    expectsTestUtils = new PhotoExpectsTestUtils(dbTestUtils);
    useCaseTestUtils = new PhotoUseCaseTestUtils(
      testedUseCase,
      expectsTestUtils,
    );
  });

  describe(`${GetPhotoUseCase.prototype.execute.name}`, () => {
    let useCaseParams: IGetPhotoParams;
    let photoToGet: IPhoto;

    beforeEach(async () => {
      photoToGet = await dumbPhotoGenerator.generatePhoto();

      useCaseParams = photoToGet._id;
    });

    describe("when the required photo does not have a stored image", () => {
      it(`should throw an error with status code ${HttpErrorCode.NotFound} (not found)`, async () => {
        const expectedStatus = HttpErrorCode.NotFound;

        await useCaseTestUtils.executeUseCaseAndExpectToThrow({
          useCaseParams: [useCaseParams],
          expectedStatus,
        });

        expectsTestUtils.checkAssertions();
      });
    });

    describe("when the required photo has a stored image", () => {
      beforeEach(async () => {
        await dbTestUtils.addPhoto(photoToGet);
      });

      afterEach(async () => {
        await dbTestUtils.deletePhoto(photoToGet._id);
      });

      it("should return the required photo", async () => {
        const result = await useCaseTestUtils.executeTestedUseCase(
          photoToGet._id,
        );

        expectsTestUtils.expectEqualPhotos(photoToGet, result);
        expectsTestUtils.checkAssertions();
      });

      describe("when using the `fields` option", () => {
        let options: IGetPhotoOptions = {};

        describe(`with value 'fields=[${GetPhotoField.PhotoData}]'`, () => {
          beforeEach(() => {
            options.fields = [GetPhotoField.PhotoData];
          });

          it("should return the photo with only the photo data", async () => {
            const expectedPhoto = new Photo(photoToGet._id, {
              photoData: { metadata: photoToGet.metadata },
            });

            const result = await useCaseTestUtils.executeTestedUseCase(
              useCaseParams,
              options,
            );

            expectsTestUtils.expectEqualPhotos(expectedPhoto, result);
            expectsTestUtils.checkAssertions();
          });
        });

        describe(`with value 'fields=[${GetPhotoField.ImageBuffer}]'`, () => {
          beforeEach(() => {
            options.fields = [GetPhotoField.ImageBuffer];
          });

          it("should return the photo with only the image", async () => {
            const expectedPhoto = new Photo(photoToGet._id);

            const result = await useCaseTestUtils.executeTestedUseCase(
              useCaseParams,
              options,
            );

            expectsTestUtils.expectEqualPhotos(expectedPhoto, result);
            expectsTestUtils.checkAssertions();
          });
        });
      });
    });
  });
});
