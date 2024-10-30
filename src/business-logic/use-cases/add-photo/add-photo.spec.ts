import { omit } from "ramda";

import { dumbPhotoGenerator } from "@adapters";
import { AssertionsCounter, IAssertionsCounter, sharedTestUtils } from "@utils";

import { FakePhotoImageDb, FakePhotoMetadataDb } from "../../../adapters";
import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { IPhoto } from "../../models";
import { AddPhoto } from "./add-photo";
import { AddPhotoTestUtils } from "./add-photo.test-utils";

describe("add-photo use case", () => {
  let addPhoto: AddPhoto;
  let metadataDb: IPhotoMetadataDb;
  let imageDb: IPhotoImageDb;
  let testUtils: AddPhotoTestUtils;
  let assertionsCounter: IAssertionsCounter;
  let photo: IPhoto;

  beforeEach(async () => {
    metadataDb = new FakePhotoMetadataDb();
    imageDb = new FakePhotoImageDb();
    testUtils = new AddPhotoTestUtils({ metadataDb, imageDb });
    assertionsCounter = new AssertionsCounter();
    addPhoto = new AddPhoto(metadataDb, imageDb);
    photo = dumbPhotoGenerator.generatePhoto();
  });

  describe("photo image", () => {
    it("should be uploaded to image db", async () => {
      await addPhoto.execute(photo);
      await testUtils.expectPhotoImageToBeInDb(photo, assertionsCounter);
      assertionsCounter.checkAssertions();
    });
  });

  describe("photo metadata", () => {
    it("should be added to metadata db", async () => {
      await addPhoto.execute(photo);
      await testUtils.expectPhotoMetadataToBeInDb(photo, assertionsCounter);
      assertionsCounter.checkAssertions();
    });

    it.each`
      case           | imageBuffer
      ${"undefined"} | ${undefined}
      ${"null"}      | ${null}
      ${"empty"}     | ${{}}
    `(
      "should throw if image buffer is `$case` and not upload metadata",
      async ({ imageBuffer }) => {
        const assertionsCounter = new AssertionsCounter();
        const photoWithInvalidImage = omit(["imageBuffer"], photo) as IPhoto;
        photoWithInvalidImage.imageBuffer = imageBuffer;

        await sharedTestUtils.expectRejection({
          asyncFn: addPhoto.execute,
          fnParams: [photoWithInvalidImage],
          assertionsCounter,
        });
        await testUtils.expectMetadataNotToBeInDb(photo._id, assertionsCounter);
        assertionsCounter.checkAssertions();
      },
    );
  });
});
