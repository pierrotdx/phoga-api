import { dumbPhotoGenerator } from "@adapters";
import { AssertionsCounter, IAssertionsCounter, sharedTestUtils } from "@utils";

import { FakePhotoImageDb, FakePhotoMetadataDb } from "../../../adapters";
import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { ReplacePhoto } from "./replace-photo";
import { ReplacePhotoTestUtils } from "./replace-photo.test-utils";

describe("replace-photo use case", () => {
  let assertionsCounter: IAssertionsCounter;
  let replacePhoto: ReplacePhoto;
  let imageDb: IPhotoImageDb;
  let metadataDb: IPhotoMetadataDb;
  let testUtils: ReplacePhotoTestUtils;

  const photo = dumbPhotoGenerator.generatePhoto();

  beforeEach(async () => {
    assertionsCounter = new AssertionsCounter();
    imageDb = new FakePhotoImageDb();
    metadataDb = new FakePhotoMetadataDb();
    testUtils = new ReplacePhotoTestUtils({ metadataDb, imageDb });
    replacePhoto = new ReplacePhoto(metadataDb, imageDb);
    await testUtils.insertPhotoInDbs(photo);
  });

  describe("photo image", () => {
    it.each`
      case           | imageBuffer
      ${"undefined"} | ${undefined}
      ${"null"}      | ${null}
      ${"empty"}     | ${{}}
    `(
      "should throw an error if the image buffer is `$case`",
      async ({ imageBuffer }) => {
        photo.imageBuffer = imageBuffer;
        await sharedTestUtils.expectRejection({
          asyncFn: replacePhoto.execute,
          fnParams: [photo],
          assertionsCounter,
        });
        assertionsCounter.checkAssertions();
      },
    );

    it("should throw an error if the image to replace is not found", async () => {
      const newPhoto = dumbPhotoGenerator.generatePhoto();
      await sharedTestUtils.expectRejection({
        asyncFn: replacePhoto.execute,
        fnParams: [newPhoto],
        assertionsCounter,
      });
      assertionsCounter.checkAssertions();
    });

    it("should be replaced in image db", async () => {
      const dbImageBefore = await testUtils.getPhotoImageFromDb(photo._id);
      const newImageBuffer = Buffer.from("new image");
      photo.imageBuffer = newImageBuffer;
      await replacePhoto.execute(photo);
      await testUtils.expectImageToBeReplacedInDb(
        dbImageBefore,
        newImageBuffer,
        photo._id,
      );
    });
  });

  describe("photo metadata", () => {
    it("should replace the data in the metadata db", async () => {
      const newPhoto = dumbPhotoGenerator.generatePhoto({ _id: photo._id });
      const dbMetadataBefore = await metadataDb.getById(photo._id);
      await replacePhoto.execute(newPhoto);
      await testUtils.expectMetadataToBeReplacedInDb(
        photo._id,
        dbMetadataBefore,
        newPhoto.metadata,
      );
    });

    it.each`
      case           | imageBuffer
      ${"undefined"} | ${undefined}
      ${"null"}      | ${null}
      ${"empty"}     | ${{}}
    `(
      "should not change if the image buffer is `$case`",
      async ({ imageBuffer }) => {
        const metadataBefore = await metadataDb.getById(photo._id);
        photo.imageBuffer = imageBuffer;

        await sharedTestUtils.expectRejection({
          asyncFn: replacePhoto.execute,
          fnParams: [photo],
          assertionsCounter,
        });
        await testUtils.expectToMatchPhotoMetadata(
          photo._id,
          metadataBefore,
          assertionsCounter,
        );
        assertionsCounter.checkAssertions();
      },
    );

    it("should add metadata in db if the photo to replace only had an image and no metadata before", async () => {
      await metadataDb.delete(photo._id);
      const dbMetadataBefore = await metadataDb.getById(photo._id);

      const newPhoto = dumbPhotoGenerator.generatePhoto({ _id: photo._id });
      await replacePhoto.execute(newPhoto);

      expect(dbMetadataBefore).toBeUndefined();
      assertionsCounter.increase();

      await testUtils.expectToMatchPhotoMetadata(
        newPhoto._id,
        newPhoto.metadata,
        assertionsCounter,
      );

      assertionsCounter.checkAssertions();
    });
  });
});
