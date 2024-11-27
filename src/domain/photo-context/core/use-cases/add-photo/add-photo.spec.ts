import { omit } from "ramda";

import { AssertionsCounter, IAssertionsCounter } from "@assertions-counter";
import { dumbPhotoGenerator } from "@dumb-photo-generator";
import { ImageEditor } from "@shared";

import {
  FakePhotoImageDb,
  FakePhotoMetadataDb,
} from "../../../adapters/secondary";
import { IPhoto, thumbnailSize } from "../../models";
import { ThumbnailSetter } from "../../thumbnail-setter";
import { AddPhoto } from "./add-photo";
import { AddPhotoTestUtils } from "./add-photo.test-utils";

describe(`${AddPhoto.name}`, () => {
  const photoMetadataDb = new FakePhotoMetadataDb();
    const photoImageDb = new FakePhotoImageDb();
  const imageEditor = new ImageEditor();
  const thumbnailSetter = new ThumbnailSetter(imageEditor);
  const testUtils = new AddPhotoTestUtils(
    photoMetadataDb,
    photoImageDb,
    imageEditor,
  );
  let addPhoto: AddPhoto;
  let assertionsCounter: IAssertionsCounter;

  beforeEach(async () => {
    addPhoto = new AddPhoto(
      testUtils.photoMetadataDb,
      testUtils.photoImageDb,
      thumbnailSetter,
    );
    assertionsCounter = new AssertionsCounter();
  });

  describe(`${AddPhoto.prototype.execute.name}`, () => {
    it("should upload photo image and metadata to their respective DBs", async () => {
      const photo = await dumbPhotoGenerator.generatePhoto();
      await addPhoto.execute(photo);
      await testUtils.expectPhotoToBeUploaded(photo, assertionsCounter);
    });

    it(`should always have at least a thumbnail in the metadata with size \'${JSON.stringify(thumbnailSize)}\'`, async () => {
      const photo = await dumbPhotoGenerator.generatePhoto();
      delete photo.metadata;
      await addPhoto.execute(photo);
      await testUtils.expectThumbnailToBeInDb(photo, assertionsCounter);
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
