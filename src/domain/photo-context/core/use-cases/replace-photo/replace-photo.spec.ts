import { AssertionsCounter, IAssertionsCounter } from "@assertions-counter";
import { dumbPhotoGenerator } from "@dumb-photo-generator";
import { ImageEditor } from "@shared";

import {
  FakePhotoImageDb,
  FakePhotoMetadataDb,
} from "../../../adapters/secondary";
import { IPhoto } from "../../models";
import { ThumbnailSetter } from "../../thumbnail-setter";
import { ReplacePhoto } from "./replace-photo";
import { ReplacePhotoTestUtils } from "./replace-photo.test-utils";

describe(`${ReplacePhoto.name}`, () => {
  const photoMetadataDb = new FakePhotoMetadataDb();
  const photoImageDb = new FakePhotoImageDb();
  const imageEditor = new ImageEditor();
  const testUtils = new ReplacePhotoTestUtils(photoMetadataDb, photoImageDb);
  const thumbnailSetter = new ThumbnailSetter(imageEditor);
  let photo: IPhoto;
  let replacePhoto: ReplacePhoto;
  let assertionsCounter: IAssertionsCounter;

  beforeEach(async () => {
    photo = await dumbPhotoGenerator.generatePhoto();
    replacePhoto = new ReplacePhoto(
      testUtils.photoMetadataDb,
      testUtils.photoImageDb,
      thumbnailSetter,
    );
    assertionsCounter = new AssertionsCounter();
    await testUtils.insertPhotoInDb(photo);
  });

  afterEach(async () => {
    await testUtils.deletePhotoIfNecessary(photo._id);
  });

  describe(`${ReplacePhoto.prototype.execute.name}`, () => {
    it("should replace photo metadata and image in their respective DBs", async () => {
      const dbPhotoBefore = await testUtils.getPhotoFromDb(photo._id);
      const replacingPhoto = await dumbPhotoGenerator.generatePhoto({
        _id: photo._id,
      });
      await replacePhoto.execute(replacingPhoto);
      await testUtils.expectPhotoToBeReplacedInDb(
        dbPhotoBefore,
        replacingPhoto,
        assertionsCounter,
      );
    });

    it("should add metadata in db if the photo to replace only had an image and no metadata before", async () => {
      await testUtils.deletePhotoMetadata(photo._id);
      const photoBefore = await testUtils.getPhotoFromDb(photo._id);
      const dbMetadataBefore = photoBefore.metadata;

      const replacingPhoto = await dumbPhotoGenerator.generatePhoto({
        _id: photo._id,
      });
      await replacePhoto.execute(replacingPhoto);

      expect(dbMetadataBefore).toBeUndefined();
      assertionsCounter.increase();
      await testUtils.expectPhotoMetadataToBeInDb(
        replacingPhoto,
        assertionsCounter,
      );
      assertionsCounter.checkAssertions();
    });

    it(`should generate a thumbnail in the metadata if not provided`, async () => {
      const replacingPhoto = await dumbPhotoGenerator.generatePhoto({
        _id: photo._id,
      });
      const setThumbnailSpy = jest.spyOn(thumbnailSetter, "set");
      delete replacingPhoto.metadata;
      await replacePhoto.execute(replacingPhoto);
      expect(setThumbnailSpy).toHaveBeenCalledTimes(1);
      expect.assertions(1);
    });

    it.each`
      case           | imageBuffer
      ${"undefined"} | ${undefined}
      ${"null"}      | ${null}
      ${"empty"}     | ${{}}
    `(
      "should throw an error if the image buffer is `$case` and not update metadata",
      async ({ imageBuffer }) => {
        photo.imageBuffer = imageBuffer;
        await testUtils.expectRejectionAndNoMetadataUpdate({
          expectedPhoto: photo,
          fnExpectedToReject: replacePhoto.execute,
          fnParams: [photo],
          assertionsCounter,
        });
      },
    );

    it("should throw an error if the image to replace is not found", async () => {
      const newPhoto = dumbPhotoGenerator.generatePhoto();
      await testUtils.expectRejection({
        fnExpectedToReject: replacePhoto.execute,
        fnParams: [newPhoto],
        assertionsCounter,
      });
      assertionsCounter.checkAssertions();
    });
  });
});
