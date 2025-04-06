import { omit } from "ramda";

import {
  AssertionsCounter,
  IAssertionsCounter,
} from "@shared/assertions-counter";

import {
  FakePhotoImageDb,
  FakePhotoMetadataDb,
  dumbPhotoGenerator,
} from "../../../adapters/";
import { IPhoto } from "../../models";
import { AddPhoto } from "./add-photo";
import { AddPhotoTestUtils } from "./add-photo.test-utils";

describe(`${AddPhoto.name}`, () => {
  const photoMetadataDb = new FakePhotoMetadataDb();
  const photoImageDb = new FakePhotoImageDb();
  const testUtils = new AddPhotoTestUtils(photoMetadataDb, photoImageDb);
  let addPhoto: AddPhoto;
  let assertionsCounter: IAssertionsCounter;

  beforeEach(async () => {
    addPhoto = new AddPhoto(testUtils.photoMetadataDb, testUtils.photoImageDb);
    assertionsCounter = new AssertionsCounter();
  });

  describe(`${AddPhoto.prototype.execute.name}`, () => {
    it("should upload photo image and metadata to their respective DBs", async () => {
      const photo = await dumbPhotoGenerator.generatePhoto();
      await addPhoto.execute(photo);
      await testUtils.expectPhotoToBeUploaded(photo, assertionsCounter);
    });

    it.each`
      case           | imageBuffer
      ${"undefined"} | ${undefined}
      ${"null"}      | ${null}
      ${"empty"}     | ${{}}
    `(
      "should throw if image buffer is `$case` and not upload metadata",
      async ({ imageBuffer }) => {
        const photo = await dumbPhotoGenerator.generatePhoto();
        const photoWithInvalidImage = omit(["imageBuffer"], photo) as IPhoto;
        photoWithInvalidImage.imageBuffer = imageBuffer;

        await testUtils.expectThrowAndNoMetadataUpdate({
          fnExpectedToReject: addPhoto.execute,
          fnParams: [photoWithInvalidImage],
          photo,
          assertionsCounter,
        });
      },
    );
  });
});
