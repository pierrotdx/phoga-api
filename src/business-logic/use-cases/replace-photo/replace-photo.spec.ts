import { dumbPhotoGenerator } from "@adapters";
import { Counter, ICounter, sharedTestUtils } from "@utils";

import { FakePhotoImageDb, FakePhotoMetadataDb } from "../../../adapters";
import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { ReplacePhoto } from "./replace-photo";
import { ReplacePhotoTestUtils } from "./replace-photo.test-utils";

describe("replace-photo use case", () => {
  let assertionsCounter: ICounter;
  let replacePhoto: ReplacePhoto;
  let imageDb: IPhotoImageDb;
  let metadataDb: IPhotoMetadataDb;
  let replacePhotoTestUtils: ReplacePhotoTestUtils;

  const photo = dumbPhotoGenerator.generate();

  beforeEach(async () => {
    assertionsCounter = new Counter();
    imageDb = new FakePhotoImageDb();
    metadataDb = new FakePhotoMetadataDb();
    replacePhotoTestUtils = new ReplacePhotoTestUtils(metadataDb, imageDb);
    replacePhoto = new ReplacePhoto(metadataDb, imageDb);
    await replacePhotoTestUtils.insertPhotoInDbs(photo);
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
        sharedTestUtils.checkAssertionsCount(assertionsCounter);
      },
    );

    it("should throw an error if the image to replace is not found", async () => {
      const newPhoto = dumbPhotoGenerator.generate();
      await sharedTestUtils.expectRejection({
        asyncFn: replacePhoto.execute,
        fnParams: [newPhoto],
        assertionsCounter,
      });
      sharedTestUtils.checkAssertionsCount(assertionsCounter);
    });

    it("should be replaced in image db", async () => {
      const dbImageBefore = await replacePhotoTestUtils.getPhotoImageFromDb(
        photo._id,
      );
      const newImageBuffer = Buffer.from("new image");
      photo.imageBuffer = newImageBuffer;
      await replacePhoto.execute(photo);
      await replacePhotoTestUtils.expectImageToBeReplacedInDb(
        dbImageBefore,
        newImageBuffer,
        photo._id,
      );
    });
  });

  describe("photo metadata", () => {
    it("should replace the data in the metadata db", async () => {
      const newPhoto = dumbPhotoGenerator.generate({ _id: photo._id });
      const dbMetadataBefore = await metadataDb.getById(photo._id);
      await replacePhoto.execute(newPhoto);
      await replacePhotoTestUtils.expectMetadataToBeReplacedInDb(
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
        await replacePhotoTestUtils.expectToMatchPhotoMetadata(
          photo._id,
          metadataBefore,
          assertionsCounter,
        );
        sharedTestUtils.checkAssertionsCount(assertionsCounter);
      },
    );

    it("should add metadata in db if the photo to replace only had an image and no metadata before", async () => {
      await metadataDb.delete(photo._id);
      const dbMetadataBefore = await metadataDb.getById(photo._id);

      const newPhoto = dumbPhotoGenerator.generate({ _id: photo._id });
      await replacePhoto.execute(newPhoto);

      expect(dbMetadataBefore).toBeUndefined();
      assertionsCounter.increase();

      await replacePhotoTestUtils.expectToMatchPhotoMetadata(
        newPhoto._id,
        newPhoto.metadata,
        assertionsCounter,
      );

      sharedTestUtils.checkAssertionsCount(assertionsCounter);
    });
  });
});
