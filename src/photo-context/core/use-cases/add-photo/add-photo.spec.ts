import { HttpErrorCode } from "#shared/models";
import {
  DbTagTestUtils,
  IPhotoDbTestUtils,
  IPhotoExpectsTestUtils,
  PhotoDbTestUtils,
  PhotoExpectsTestUtils,
} from "#shared/test-utils";
import { ITag, ITagDb, TagDbFake } from "#tag-context";
import { pick } from "ramda";

import {
  FakePhotoDataDb,
  FakePhotoImageDb,
  dumbPhotoGenerator,
} from "../../../adapters/";
import { IPhotoDataDb, IPhotoImageDb } from "../../../core";
import {
  IAddPhotoParams,
  IPhoto,
  IPhotoStoredData,
  IPhotoUseCaseTestUtils,
} from "../../models";
import { PhotoUseCaseTestUtils } from "../test-utils";
import { AddPhotoUseCase } from "./add-photo";

describe(`${AddPhotoUseCase.name}`, () => {
  let photoDataDb: IPhotoDataDb;
  let photoImageDb: IPhotoImageDb;
  let tagDb: ITagDb;

  let useCaseTestUtils: IPhotoUseCaseTestUtils<void>;
  let dbTestUtils: IPhotoDbTestUtils;
  let expectTestUtils: IPhotoExpectsTestUtils;
  let tagTestUtils: DbTagTestUtils;

  beforeEach(async () => {
    photoDataDb = new FakePhotoDataDb();
    photoImageDb = new FakePhotoImageDb();
    tagDb = new TagDbFake();

    const testedUseCase = new AddPhotoUseCase(photoDataDb, photoImageDb, tagDb);

    dbTestUtils = new PhotoDbTestUtils(photoDataDb, photoImageDb);
    expectTestUtils = new PhotoExpectsTestUtils(dbTestUtils);
    useCaseTestUtils = new PhotoUseCaseTestUtils(
      testedUseCase,
      expectTestUtils,
    );
    tagTestUtils = new DbTagTestUtils(tagDb);
  });

  describe(`${AddPhotoUseCase.prototype.execute.name}`, () => {
    let useCaseParams: IAddPhotoParams;

    describe("when there is no image to upload", () => {
      beforeEach(async () => {
        const photoWithoutImage = dumbPhotoGenerator.generatePhoto();
        delete photoWithoutImage.imageBuffer;
        useCaseParams = photoWithoutImage;
      });

      it(`should throw an error with status code ${HttpErrorCode.BadRequest} (bad request)`, async () => {
        const expectedStatus = HttpErrorCode.BadRequest;
        await useCaseTestUtils.executeUseCaseAndExpectToThrow({
          useCaseParams: [useCaseParams],
          expectedStatus,
        });
        expectTestUtils.checkAssertions();
      });

      it(`should not upload anything to the photo-data db`, async () => {
        try {
          await useCaseTestUtils.executeTestedUseCase(useCaseParams);
        } catch (err) {
          console.log(err);
        } finally {
          await expectTestUtils.expectPhotoStoredDataToBe(
            useCaseParams._id,
            undefined,
          );
          expectTestUtils.checkAssertions();
        }
      });
    });

    describe("when there is an image to upload", () => {
      let photo: IPhoto;

      beforeEach(async () => {
        photo = dumbPhotoGenerator.generatePhoto();
      });

      it("should upload the image to the photo-image db", async () => {
        useCaseParams = pick(["_id", "imageBuffer"], photo);
        await useCaseTestUtils.executeTestedUseCase(useCaseParams);

        await expectTestUtils.expectPhotoImageToBe(
          useCaseParams._id,
          useCaseParams.imageBuffer,
        );
        expectTestUtils.checkAssertions();
      });

      describe("when there is no data (other than image) to upload", () => {
        beforeEach(() => {
          useCaseParams = pick(["_id", "imageBuffer"], photo);
        });

        it("should create a document with the manifest and image url to the photo-data db", async () => {
          const fakeDate = new Date("2025-06-23");
          jest.useFakeTimers().setSystemTime(fakeDate);

          const expectedStoredData: IPhotoStoredData = {
            _id: useCaseParams._id,
            manifest: {
              creation: fakeDate,
              lastUpdate: fakeDate,
            },
          };

          await useCaseTestUtils.executeTestedUseCase(useCaseParams);
          jest.useRealTimers();

          const imageUrl = await photoImageDb.getUrl(useCaseParams._id);
          expectedStoredData.imageUrl = imageUrl;

          await expectTestUtils.expectPhotoStoredDataToBe(
            useCaseParams._id,
            expectedStoredData,
          );
          expectTestUtils.checkAssertions();
        });
      });

      describe("when there is data (other than image) to upload", () => {
        const tags: ITag[] = [
          { _id: "tag1", name: "tag1" },
          { _id: "tag2", name: "tag2" },
        ];
        const tagIds = tags.map((t) => t._id);

        beforeEach(async () => {
          await tagTestUtils.insertTagsInDb(tags);

          useCaseParams = { ...photo, tagIds };
        });

        afterEach(async () => {
          await tagTestUtils.deleteTagsFromDb(tags);
        });

        it("should upload the data (other than image) to the photo-data db", async () => {
          const fakeDate = new Date("2025-06-23");
          jest.useFakeTimers().setSystemTime(fakeDate);

          const expectedStoredData: IPhotoStoredData = {
            _id: useCaseParams._id,
            metadata: useCaseParams.metadata,
            tags,
            manifest: {
              creation: fakeDate,
              lastUpdate: fakeDate,
            },
          };

          await useCaseTestUtils.executeTestedUseCase(useCaseParams);
          jest.useRealTimers();

          const imageUrl = await photoImageDb.getUrl(useCaseParams._id);
          expectedStoredData.imageUrl = imageUrl;

          await expectTestUtils.expectPhotoStoredDataToBe(
            useCaseParams._id,
            expectedStoredData,
          );
          expectTestUtils.checkAssertions();
        });
      });
    });
  });
});
