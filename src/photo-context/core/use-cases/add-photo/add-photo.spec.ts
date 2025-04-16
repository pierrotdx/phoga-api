import { HttpErrorCode } from "#shared/models";
import {
  DbTagTestUtils,
  PhotoTestUtils,
  TagTestUtils,
} from "#shared/test-utils";
import { ITag, ITagDb, TagDbFake } from "#tag-context";

import {
  FakePhotoDataDb,
  FakePhotoImageDb,
  dumbPhotoGenerator,
} from "../../../adapters/";
import { IPhotoDataDb, IPhotoImageDb } from "../../../core";
import {
  IAddPhotoParams,
  IAddPhotoUseCase,
  IPhotoStoredData,
} from "../../models";
import { AddPhotoUseCase } from "./add-photo";

describe(`${AddPhotoUseCase.name}`, () => {
  let photoDataDb: IPhotoDataDb;
  let photoImageDb: IPhotoImageDb;
  let tagDb: ITagDb;

  let testedUseCase: IAddPhotoUseCase;

  let photoTestUtils: PhotoTestUtils<void>;
  let tagTestUtils: DbTagTestUtils;

  beforeEach(async () => {
    photoDataDb = new FakePhotoDataDb();
    photoImageDb = new FakePhotoImageDb();
    tagDb = new TagDbFake();

    testedUseCase = new AddPhotoUseCase(photoDataDb, photoImageDb, tagDb);

    photoTestUtils = new PhotoTestUtils(
      photoDataDb,
      photoImageDb,
      testedUseCase,
    );

    tagTestUtils = new DbTagTestUtils(tagDb);
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
        await photoTestUtils.executeUseCaseAndExpectToThrow({
          useCaseParams: [useCaseParams],
          expectedStatus,
        });
        photoTestUtils.checkAssertions();
      });

      it(`should not upload anything to the photo-data db`, async () => {
        try {
          await photoTestUtils.executeTestedUseCase(useCaseParams);
        } catch (err) {
        } finally {
          await photoTestUtils.expectPhotoStoredDataToBe(
            useCaseParams._id,
            undefined,
          );
          photoTestUtils.checkAssertions();
        }
      });
    });

    describe("when there is an image to upload", () => {
      const tags: ITag[] = [
        { _id: "tag1", name: "tag1" },
        { _id: "tag2", name: "tag2" },
      ];
      const tagIds = tags.map((t) => t._id);

      beforeEach(async () => {
        const photo = await dumbPhotoGenerator.generatePhoto();

        await tagTestUtils.insertTagsInDb(tags);

        useCaseParams = { ...photo, tagIds };
      });

      afterEach(async () => {
        await tagTestUtils.deleteTagsFromDb(tags);
      });

      it("should upload the image to the photo-image db", async () => {
        await photoTestUtils.executeTestedUseCase(useCaseParams);

        await photoTestUtils.expectPhotoStoredImageToBe(
          useCaseParams._id,
          useCaseParams.imageBuffer,
        );
        photoTestUtils.checkAssertions();
      });

      it("should upload the data (other than image) to the photo-data db", async () => {
        const expectedStoredData: IPhotoStoredData = {
          _id: useCaseParams._id,
          metadata: useCaseParams.metadata,
          tags,
        };

        await photoTestUtils.executeTestedUseCase(useCaseParams);

        await photoTestUtils.expectPhotoStoredDataToBe(
          useCaseParams._id,
          expectedStoredData,
        );
        photoTestUtils.checkAssertions();
      });
    });
  });
});
