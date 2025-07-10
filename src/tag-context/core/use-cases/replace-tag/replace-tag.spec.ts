import {
  FakePhotoDataDb,
  IPhotoDataDb,
  IPhotoStoredData,
  dumbPhotoGenerator,
} from "#photo-context";
import { IPhotoDbTestUtils, PhotoDbTestUtils } from "#shared/test-utils";

import { TagDbFake } from "../../../adapters";
import { ITagDb } from "../../gateways";
import { ITag } from "../../models";
import { ReplaceTagTestUtils } from "./replace-tag.test-utils";

describe("ReplaceTag", () => {
  let tagDb: ITagDb;
  let photoDataDb: IPhotoDataDb;

  let testUtils: ReplaceTagTestUtils;
  let photoDbTestUtils: IPhotoDbTestUtils;

  const newTag: ITag = { _id: "dumb-id", name: "new tag" };
  const tagCreationDate = new Date("2012-03-27");

  beforeEach(() => {
    tagDb = new TagDbFake();
    photoDataDb = new FakePhotoDataDb();

    photoDbTestUtils = new PhotoDbTestUtils(photoDataDb);
    testUtils = new ReplaceTagTestUtils(tagDb, photoDataDb);
  });

  afterEach(async () => {
    await testUtils.removeTagFromDb(newTag._id);
  });

  describe("when there is already a tag with the same id in db", () => {
    let tagToReplace: ITag;

    beforeEach(async () => {
      tagToReplace = { _id: newTag._id, name: "tag to replace" };
      await testUtils.insertTagInDb(tagToReplace, tagCreationDate);
    });

    afterEach(async () => {
      await testUtils.removeTagFromDb(tagToReplace._id);
    });

    it("should replace the tag in tags db", async () => {
      const lastUpdate = new Date("2024-03-23");
      const expectedTag: ITag = {
        ...newTag,
        manifest: {
          creation: tagCreationDate,
          lastUpdate,
        },
      };

      jest.useFakeTimers().setSystemTime(lastUpdate);
      await testUtils.executeUseCase(newTag);
      jest.useRealTimers();

      await testUtils.expectTagToBeInDb(expectedTag);
    });

    describe("when the tag was stored in photos", () => {
      let photoStoredData: IPhotoStoredData;
      const photoCreationDate = new Date("1993-07-23");

      beforeEach(async () => {
        photoStoredData = dumbPhotoGenerator.generatePhotoStoredData({
          tags: [tagToReplace],
        });
        await photoDbTestUtils.addStoredPhotosData(
          [photoStoredData],
          photoCreationDate,
        );
      });

      afterEach(async () => {
        await photoDbTestUtils.deletePhoto(photoStoredData._id);
      });

      it("should replace the tag in the photos db", async () => {
        const lastUpdate = new Date("2021-04-04");
        const expectedTag: ITag = {
          ...newTag,
          manifest: {
            creation: tagCreationDate,
            lastUpdate,
          },
        };
        const expectedPhotoStoredData: IPhotoStoredData = {
          ...photoStoredData,
          tags: [expectedTag],
        };

        jest.useFakeTimers().setSystemTime(lastUpdate);
        await testUtils.executeUseCase(newTag);
        jest.useRealTimers();

        const photoStoredDataAfterTagReplace =
          await photoDbTestUtils.getPhotoStoredData(photoStoredData._id);
        expect(photoStoredDataAfterTagReplace).toEqual(expectedPhotoStoredData);
        expect.assertions(1);
      });
    });
  });

  describe("when there is no tag with the same id in db", () => {
    it("should add the tag to the db", async () => {
      const expectedTag: ITag = { ...newTag };
      expectedTag.manifest = {
        creation: tagCreationDate,
        lastUpdate: tagCreationDate,
      };

      jest.useFakeTimers().setSystemTime(tagCreationDate);
      await testUtils.executeUseCase(newTag);
      jest.useRealTimers();

      await testUtils.expectTagToBeInDb(expectedTag);
    });
  });
});
