import {
  FakePhotoDataDb,
  IPhotoDataDb,
  IPhotoStoredData,
  Photo,
} from "#photo-context";
import { IPhotoDbTestUtils, PhotoDbTestUtils } from "#shared/test-utils";

import { TagDbFake } from "../../../adapters";
import { ITagDb } from "../../gateways";
import { ITag } from "../../models";
import { DeleteTagTestUtils } from "./delete-tag.test-utils";

describe("DeleteTag", () => {
  let tagDb: ITagDb;
  let photoDataDb: IPhotoDataDb;

  let testUtils: DeleteTagTestUtils;
  let photoDbTestUtils: IPhotoDbTestUtils;

  const tagToDelete: ITag = {
    _id: "tag-to-delete-id",
    name: "the tag to delete",
  };

  beforeEach(async () => {
    tagDb = new TagDbFake();
    photoDataDb = new FakePhotoDataDb();

    testUtils = new DeleteTagTestUtils(tagDb, photoDataDb);
    photoDbTestUtils = new PhotoDbTestUtils(photoDataDb);

    await testUtils.insertTagInDb(tagToDelete);
  });

  it("should delete the requested tag", async () => {
    await testUtils.executeUseCase(tagToDelete._id);

    await testUtils.expectTagToBeDeleted(tagToDelete._id);
  });

  describe("when the tag was stored in photos", () => {
    let photoWithTagToDelete: IPhotoStoredData;
    const dumbTag: ITag = { _id: "dumb tag id" };

    beforeEach(async () => {
      photoDbTestUtils = new PhotoDbTestUtils(photoDataDb);

      photoWithTagToDelete = new Photo("photoWithTagToDelete", {
        photoData: {
          tags: [tagToDelete, dumbTag],
        },
      });
      await photoDbTestUtils.addStoredPhotosData([photoWithTagToDelete]);
    });

    afterEach(async () => {
      await photoDbTestUtils.deletePhoto(photoWithTagToDelete._id);
    });

    it("should delete the tag in the photos db", async () => {
      const expectedPhotoStoredData: IPhotoStoredData = {
        ...photoWithTagToDelete,
        tags: [dumbTag],
      };

      await testUtils.executeUseCase(tagToDelete._id);
      const photoStoredDataAfterTagReplace =
        await photoDbTestUtils.getPhotoStoredData(photoWithTagToDelete._id);

      expect(photoStoredDataAfterTagReplace).toEqual(expectedPhotoStoredData);
      expect.assertions(1);
    });
  });
});
