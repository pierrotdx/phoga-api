import { AddPhoto } from "./add-photo";
import { IPhoto, Photo } from "../../models";
import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { FakePhotoMetadataDb, FakePhotoImageDb } from "../../../adapters";

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
    await (imageDb as FakePhotoImageDb).createDir();
  });

  afterEach(async () => {
    await (imageDb as FakePhotoImageDb).removeDir();
  });

  describe("photo image", () => {
    it("should be uploaded to image db", async () => {
      await addPhoto.execute(photo);

      const uploadedImageBuffer = await imageDb.getById(photo._id);
      expect(uploadedImageBuffer.compare(photo.imageBuffer as Buffer)).toBe(0);
      expect.assertions(1);
    });

    it("should throw if there is no image buffer", async () => {
      try {
        delete photo.imageBuffer;
        await addPhoto.execute(photo);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
      expect.assertions(1);
    });
  });

  describe("photo metadata", () => {
    it("should be added to metadata db", async () => {
      await addPhoto.execute(photo);

      const metadataFromDb = await metadataDb.getById(photo._id);
      expect(metadataFromDb).toEqual(photo.metadata);
      expect.assertions(1);
    });

    it("should not be added if there is no image buffer", async () => {
      try {
        delete photo.imageBuffer;
        await addPhoto.execute(photo);
      } catch (err) {
        const metadataFromDb = await metadataDb.getById(photo._id);
        expect(metadataFromDb).toBeUndefined();
      }
      expect.assertions(1);
    });
  });
});
