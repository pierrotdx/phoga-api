import {
  FakePhotoDataDb,
  IPhoto,
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
      await testUtils.insertTagInDb(tagToReplace);
    });

    afterEach(async () => {
      await testUtils.removeTagFromDb(tagToReplace._id);
    });

    it("should replace the tag in tags db", async () => {
      await testUtils.executeUseCase(newTag);

      await testUtils.expectTagToBeInDb(newTag);
    });

    describe("when the tag was stored in photos", () => {
      let photoStoredData: IPhotoStoredData;

      beforeEach(async () => {
        photoStoredData = dumbPhotoGenerator.generatePhotoStoredData({
          tags: [tagToReplace],
        });
        await photoDbTestUtils.addStoredPhotosData([photoStoredData]);
      });

      afterEach(async () => {
        await photoDbTestUtils.deletePhoto(photoStoredData._id);
      });

      it("should replace the tag in the photos db", async () => {
        const expectedPhotoStoredData: IPhotoStoredData = {
          ...photoStoredData,
          tags: [newTag],
        };

        await testUtils.executeUseCase(newTag);
        const photoStoredDataAfterTagReplace =
          await photoDbTestUtils.getPhotoStoredData(photoStoredData._id);

        expect(photoStoredDataAfterTagReplace).toEqual(expectedPhotoStoredData);
        expect.assertions(1);
      });
    });
  });

  describe("when there is no tag with the same id in db", () => {
    it("should add the tag to the db", async () => {
      await testUtils.executeUseCase(newTag);

      await testUtils.expectTagToBeInDb(newTag);
    });
  });
});
