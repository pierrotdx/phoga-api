import { FakePhotoImageDb, FakePhotoMetadataDb } from "../../../adapters";
import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { IPhoto, Photo } from "../../models";
import { AddPhoto } from "./add-photo";

describe("add-photo use case", () => {
  let addPhoto: AddPhoto;
  let metadataDb: IPhotoMetadataDb;
  let imageDb: IPhotoImageDb;

  let photo: IPhoto;

  beforeEach(async () => {
    metadataDb = new FakePhotoMetadataDb();
    imageDb = new FakePhotoImageDb();
    addPhoto = new AddPhoto(metadataDb, imageDb);

    photo = new Photo("dumb photo id", {
      metadata: {
        titles: ["title 1", "title2"],
        date: new Date(),
        description: "dumb description",
        location: "Paris",
      },
      imageBuffer: Buffer.from("dumb buffer content"),
    });
  });

  describe("photo image", () => {
    it("should be uploaded to image db", async () => {
      await addPhoto.execute(photo);

      const uploadedImageBuffer = await imageDb.getById(photo._id);
      expect(uploadedImageBuffer.compare(photo.imageBuffer as Buffer)).toBe(0);
      expect.assertions(1);
    });

    it.each`
      case           | imageBuffer
      ${"undefined"} | ${undefined}
      ${"null"}      | ${null}
      ${"empty"}     | ${{}}
    `("should throw if image buffer is `$case`", async ({ imageBuffer }) => {
      try {
        photo.imageBuffer = imageBuffer;
        await addPhoto.execute(photo);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      } finally {
        expect.assertions(1);
      }
    });
  });

  describe("photo metadata", () => {
    it("should be added to metadata db", async () => {
      await addPhoto.execute(photo);

      const metadataFromDb = await metadataDb.getById(photo._id);
      expect(metadataFromDb).toEqual(photo.metadata);
      expect.assertions(1);
    });

    it.each`
      case           | imageBuffer
      ${"undefined"} | ${undefined}
      ${"null"}      | ${null}
      ${"empty"}     | ${{}}
    `(
      "should not be added if image buffer is `$case`",
      async ({ imageBuffer }) => {
        try {
          photo.imageBuffer = imageBuffer;
          await addPhoto.execute(photo);
        } catch (err) {
          const metadataFromDb = await metadataDb.getById(photo._id);
          expect(metadataFromDb).toBeUndefined();
        } finally {
          expect.assertions(1);
        }
      },
    );
  });
});
