import { omit } from "ramda";

import { dumbPhotoGenerator } from "@adapters";
import { Counter, ICounter, sharedTestUtils } from "@utils";

import { FakePhotoImageDb, FakePhotoMetadataDb } from "../../../adapters";
import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { IPhoto } from "../../models";
import { AddPhoto } from "./add-photo";
import { AddPhotoTestUtils } from "./add-photo.test-utils";

describe("add-photo use case", () => {
  let addPhoto: AddPhoto;
  let metadataDb: IPhotoMetadataDb;
  let imageDb: IPhotoImageDb;
  let addPhotoTestUtils: AddPhotoTestUtils;
  let photo: IPhoto;

  beforeEach(async () => {
    metadataDb = new FakePhotoMetadataDb();
    imageDb = new FakePhotoImageDb();
    addPhotoTestUtils = new AddPhotoTestUtils(metadataDb, imageDb);
    addPhoto = new AddPhoto(metadataDb, imageDb);
    photo = dumbPhotoGenerator.generate();
  });

  describe("photo image", () => {
    it("should be uploaded to image db", async () => {
      await addPhoto.execute(photo);
      await addPhotoTestUtils.expectImageToBeInDb(photo);
    });
  });

  describe("photo metadata", () => {
    it("should be added to metadata db", async () => {
      await addPhoto.execute(photo);
      await addPhotoTestUtils.expectMetadataToBeInDb(photo);
    });

    it.each`
      case           | imageBuffer
      ${"undefined"} | ${undefined}
      ${"null"}      | ${null}
      ${"empty"}     | ${{}}
    `(
      "should throw if image buffer is `$case` and not upload metadata",
      async ({ imageBuffer }) => {
        const assertionsCounter = new Counter();
        const photoWithInvalidImage = omit(["imageBuffer"], photo) as IPhoto;
        photoWithInvalidImage.imageBuffer = imageBuffer;

        await sharedTestUtils.expectRejection({
          asyncFn: addPhoto.execute,
          fnParams: [photoWithInvalidImage],
          assertionsCounter,
        });
        await addPhotoTestUtils.expectMetadataNotToBeInDb(
          photo._id,
          assertionsCounter,
        );
        sharedTestUtils.checkAssertionsCount(assertionsCounter);
      },
    );
  });
});
