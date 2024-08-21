import { ReplacePhoto } from "./replace-photo";
import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { FakePhotoImageDb, FakePhotoMetadataDb } from "../../../adapters";
import { Photo } from "../../models";

describe("replace-photo use case", () => {
  let replacePhoto: ReplacePhoto;
  let imageDb: IPhotoImageDb;
  let metadataDb: IPhotoMetadataDb;

  const photo = new Photo("dumb photo id", {
    metadata: {
      titles: ["title 1", "title2"],
      date: new Date(),
      description: "dumb description",
      location: "Paris",
    },
    imageBuffer: Buffer.from("dumb buffer content"),
  });

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
        const newPhoto = new Photo("id not in db", {
          imageBuffer: Buffer.from("dumb buffer"),
        });
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
      const newPhoto = new Photo(photo._id, {
        imageBuffer: Buffer.from("new photo image"),
        metadata: {
          date: new Date(),
          description: "a new description",
        },
      });
      const dbMetadataBefore = await metadataDb.getById(photo._id);

      await replacePhoto.execute(newPhoto);
      const dbMetadataAfter = await metadataDb.getById(newPhoto._id);

      expect(dbMetadataAfter).toEqual(newPhoto.metadata);
      expect(dbMetadataAfter).not.toEqual(dbMetadataBefore);

      expect(dbMetadataBefore.location).toBeDefined();
      expect(dbMetadataAfter.location).toBeUndefined();

      expect(dbMetadataBefore.titles).toBeDefined();
      expect(dbMetadataAfter.titles).toBeUndefined();

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

      const newPhoto = new Photo(photo._id, {
        imageBuffer: Buffer.from("dumb new image"),
        metadata: {
          titles: ["dumb new title 1", "dumb new title 2"],
          location: "Paris",
          date: new Date(),
          description: "new description",
        },
      });
      await replacePhoto.execute(newPhoto);
      const dbMetadataAfter = await metadataDb.getById(photo._id);

      expect(dbMetadataBefore).toBeUndefined();
      expect(dbMetadataAfter).toBeDefined();
      expect(dbMetadataAfter).toEqual(newPhoto.metadata);
      expect.assertions(3);
    });
  });
});
