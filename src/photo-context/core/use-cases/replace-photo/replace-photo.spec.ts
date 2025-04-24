import { HttpErrorCode } from "#shared/models";
import {
  DbTagTestUtils,
  IPhotoDbTestUtils,
  IPhotoExpectsTestUtils,
  PhotoDbTestUtils,
  PhotoExpectsTestUtils,
} from "#shared/test-utils";
import { ITag, ITagDb, TagDbFake } from "#tag-context";

import {
  FakePhotoDataDb,
  FakePhotoImageDb,
  dumbPhotoGenerator,
} from "../../../adapters/";
import {
  IPhotoDataDb,
  IPhotoImageDb,
  fromAddPhotoParamsToPhotoStoredData,
} from "../../../core";
import {
  IAddPhotoParams,
  IPhoto,
  IPhotoStoredData,
  IPhotoUseCaseTestUtils,
  IReplacePhotoParams,
} from "../../models";
import { PhotoUseCaseTestUtils } from "../test-utils";
import { ReplacePhotoUseCase } from "./replace-photo";

describe(`${ReplacePhotoUseCase.name}`, () => {
  let photoDataDb: IPhotoDataDb;
  let photoImageDb: IPhotoImageDb;
  let tagDb: ITagDb;

  let dbTestUtils: IPhotoDbTestUtils;
  let expectsTestUtils: IPhotoExpectsTestUtils;
  let useCaseTestUtils: IPhotoUseCaseTestUtils<void>;
  let tagTestUtils: DbTagTestUtils;

  beforeEach(async () => {
    photoDataDb = new FakePhotoDataDb();
    photoImageDb = new FakePhotoImageDb();
    tagDb = new TagDbFake();

    const testedUseCase = new ReplacePhotoUseCase(
      photoDataDb,
      photoImageDb,
      tagDb,
    );

    dbTestUtils = new PhotoDbTestUtils(photoDataDb, photoImageDb, tagDb);
    expectsTestUtils = new PhotoExpectsTestUtils(dbTestUtils);
    useCaseTestUtils = new PhotoUseCaseTestUtils(
      testedUseCase,
      expectsTestUtils,
    );
    tagTestUtils = new DbTagTestUtils(tagDb);
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

        await useCaseTestUtils.executeUseCaseAndExpectToThrow({
          useCaseParams: [useCaseParams],
          expectedStatus,
        });

        expectsTestUtils.checkAssertions();
      });
    });

    describe("when there is a photo to replace", () => {
      const tags: ITag[] = [
        { _id: "tag1", name: "tag1" },
        { _id: "tag2", name: "tag2" },
      ];
      const tagIds = tags.map((t) => t._id);

      let photoToReplaceAddPhotoParams: IAddPhotoParams;

      beforeEach(async () => {
        await tagTestUtils.insertTagsInDb(tags);

        photoToReplaceAddPhotoParams =
          await dumbPhotoGenerator.generateAddPhotoParams({ tagIds });
        await dbTestUtils.addPhoto(photoToReplaceAddPhotoParams);
      });

      afterEach(async () => {
        await dbTestUtils.deletePhoto(photoToReplaceAddPhotoParams._id);
        await tagTestUtils.deleteTagsFromDb(tags);
      });

      describe("when there is no image in the new photo", () => {
        beforeEach(async () => {
          const newPhotoWithoutImage = await dumbPhotoGenerator.generatePhoto({
            _id: photoToReplaceAddPhotoParams._id,
          });
          delete newPhotoWithoutImage.imageBuffer;

          useCaseParams = newPhotoWithoutImage;
        });

        it(`should throw an error with status code ${HttpErrorCode.BadRequest} (bad request)`, async () => {
          const expectedStatus = HttpErrorCode.BadRequest;

          await useCaseTestUtils.executeUseCaseAndExpectToThrow({
            useCaseParams: [useCaseParams],
            expectedStatus,
          });

          expectsTestUtils.checkAssertions();
        });

        it("should not update the data (other than image) in the photo-data db", async () => {
          const expectedStoreData: IPhotoStoredData =
            await fromAddPhotoParamsToPhotoStoredData(
              photoToReplaceAddPhotoParams,
              tagDb,
            );

          try {
            await useCaseTestUtils.executeTestedUseCase(useCaseParams);
          } catch (err) {
          } finally {
            await expectsTestUtils.expectPhotoStoredDataToBe(
              photoToReplaceAddPhotoParams._id,
              expectedStoreData,
            );
            expectsTestUtils.checkAssertions();
          }
        });
      });

      describe("when there is an image in the new photo", () => {
        beforeEach(async () => {
          const newPhoto = await dumbPhotoGenerator.generatePhoto({
            _id: photoToReplaceAddPhotoParams._id,
          });

          useCaseParams = { ...newPhoto, tagIds };
        });

        it("should replace the photo image in the photo-image db", async () => {
          const expectedPhotoImage = useCaseParams.imageBuffer;

          await useCaseTestUtils.executeTestedUseCase(useCaseParams);

          await expectsTestUtils.expectPhotoImageToBe(
            useCaseParams._id,
            expectedPhotoImage,
          );
          expectsTestUtils.checkAssertions();
        });

        describe("when the photo to replace had data already stored in the photo-data db", () => {
          it("should replace the data with the new one in the photo-data db", async () => {
            const expectedStoredData =
              await fromAddPhotoParamsToPhotoStoredData(useCaseParams, tagDb);

            await useCaseTestUtils.executeTestedUseCase(useCaseParams);

            await expectsTestUtils.expectPhotoStoredDataToBe(
              useCaseParams._id,
              expectedStoredData,
            );
            expectsTestUtils.checkAssertions();
          });
        });

        describe("when the photo to replace did non have any data stored in the photo-data db", () => {
          let photoWithoutDataToReplace: IPhoto;

          beforeEach(async () => {
            photoWithoutDataToReplace =
              await dumbPhotoGenerator.generatePhoto();
            delete photoWithoutDataToReplace.metadata;
            await dbTestUtils.addPhoto(photoWithoutDataToReplace);

            const newPhoto = await dumbPhotoGenerator.generatePhoto({
              _id: photoWithoutDataToReplace._id,
            });

            useCaseParams = newPhoto;
          });

          afterEach(async () => {
            await dbTestUtils.deletePhoto(photoWithoutDataToReplace._id);
          });

          it("should add the new data in the photo-data db", async () => {
            const expectedStoredData =
              await fromAddPhotoParamsToPhotoStoredData(useCaseParams, tagDb);

            await useCaseTestUtils.executeTestedUseCase(useCaseParams);

            await expectsTestUtils.expectPhotoStoredDataToBe(
              useCaseParams._id,
              expectedStoredData,
            );
            expectsTestUtils.checkAssertions();
          });
        });
      });
    });
  });
});
