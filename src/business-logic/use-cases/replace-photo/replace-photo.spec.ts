import { dumbPhotoGenerator } from "@adapters";

import { FakePhotoImageDb, FakePhotoMetadataDb } from "../../../adapters";
import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { Photo } from "../../models";
import { ReplacePhoto } from "./replace-photo";

describe("replace-photo use case", () => {
  let replacePhoto: ReplacePhoto;
  let imageDb: IPhotoImageDb;
  let metadataDb: IPhotoMetadataDb;

  const photo = dumbPhotoGenerator.generate();

  beforeEach(() => {
    imageDb = new FakePhotoImageDb();
    imageDb.insert(photo);

    metadataDb = new FakePhotoMetadataDb();
    metadataDb.insert(photo);

    replacePhoto = new ReplacePhoto(metadataDb, imageDb);
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
        try {
          photo.imageBuffer = imageBuffer;
          await replacePhoto.execute(photo);
        } catch (err) {
          expect(err).toBeDefined();
          expect(err).toBeInstanceOf(Error);
        } finally {
          expect.assertions(2);
        }
      },
    );

    it("should throw an error if the image to replace is not found", async () => {
      try {
        const newPhoto = dumbPhotoGenerator.generate();
        await replacePhoto.execute(newPhoto);
      } catch (err) {
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(Error);
      } finally {
        expect.assertions(2);
      }
    });

    it("should be replaced in image db", async () => {
      const dbImageBufferBefore = await imageDb.getById(photo._id);
      const newImageBuffer = Buffer.from("new image");
      photo.imageBuffer = newImageBuffer;

      await replacePhoto.execute(photo);

      const dbImageBufferAfter = await imageDb.getById(photo._id);
      expect(dbImageBufferAfter).toEqual(newImageBuffer);
      expect(dbImageBufferAfter).not.toEqual(dbImageBufferBefore);
      expect.assertions(2);
    });
  });

  describe("photo metadata", () => {
    it("should replace the data in the metadata db", async () => {
      const newPhoto = dumbPhotoGenerator.generate({ _id: photo._id });
      const dbMetadataBefore = await metadataDb.getById(photo._id);

      await replacePhoto.execute(newPhoto);
      const dbMetadataAfter = await metadataDb.getById(newPhoto._id);

      expect(dbMetadataAfter).toEqual(newPhoto.metadata);
      expect(dbMetadataAfter).not.toEqual(dbMetadataBefore);

      expect(dbMetadataBefore.location).toBeDefined();
      expect(dbMetadataAfter.location).not.toEqual(dbMetadataBefore.location);

      expect(dbMetadataBefore.titles).toBeDefined();
      expect(dbMetadataAfter.titles).not.toEqual(dbMetadataBefore.titles);

      expect.assertions(6);
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
        try {
          photo.imageBuffer = imageBuffer;
          await replacePhoto.execute(photo);
        } catch (err) {
          const metadataAfter = await metadataDb.getById(photo._id);
          expect(metadataAfter).toEqual(metadataBefore);
        } finally {
          expect.assertions(1);
        }
      },
    );

    it("should add metadata in db if the photo to replace only had an image and no metadata before", async () => {
      await metadataDb.delete(photo._id);
      const dbMetadataBefore = await metadataDb.getById(photo._id);

      const newPhoto = dumbPhotoGenerator.generate({ _id: photo._id });
      await replacePhoto.execute(newPhoto);
      const dbMetadataAfter = await metadataDb.getById(photo._id);

      expect(dbMetadataBefore).toBeUndefined();
      expect(dbMetadataAfter).toBeDefined();
      expect(dbMetadataAfter).toEqual(newPhoto.metadata);
      expect.assertions(3);
    });
  });
});
