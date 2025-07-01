import { HttpErrorCode } from "#shared/models";
import {
  IPhotoDbTestUtils,
  IPhotoExpectsTestUtils,
  PhotoDbTestUtils,
  PhotoExpectsTestUtils,
} from "#shared/test-utils";
import { omit } from "ramda";

import {
  FakePhotoDataDb,
  FakePhotoImageDb,
  dumbPhotoGenerator,
} from "../../../adapters/";
import { IPhotoDataDb, IPhotoImageDb } from "../../gateways";
import {
  IGetPhotoParams,
  IPhoto,
  IPhotoData,
  IPhotoUseCaseTestUtils,
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

    const testedUseCase = new GetPhotoUseCase(photoDataDb);

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
      photoToGet = dumbPhotoGenerator.generatePhoto();

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
      let imageUrl: string;

      beforeEach(async () => {
        await dbTestUtils.addPhoto(photoToGet);
        imageUrl = await photoImageDb.getUrl(photoToGet._id);
      });

      afterEach(async () => {
        await dbTestUtils.deletePhoto(photoToGet._id);
      });

      it("should return the required photo", async () => {
        const expectedResult: IPhotoData = {
          ...omit(["imageBuffer"], photoToGet),
          imageUrl,
        };

        const result = await useCaseTestUtils.executeTestedUseCase(
          photoToGet._id,
        );

        expectsTestUtils.expectEqualPhotos(expectedResult, result);
        expectsTestUtils.checkAssertions();
      });
    });
  });
});
