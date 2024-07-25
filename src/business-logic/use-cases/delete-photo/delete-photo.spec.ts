import { FakePhotoImageDb, FakePhotoMetadataDb } from "../../../adapters";
import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { Photo } from "../../models";
import { DeletePhoto } from "./delete-photo";

describe("delete-photo use case", () => {
  let deletePhoto: DeletePhoto;
  let imageDb: IPhotoImageDb;
  let metadataDb: IPhotoMetadataDb;
  const photo = new Photo("dumb id", {
    imageBuffer: Buffer.from("dumb buffer"),
    metadata: {
      titles: ["title 1", "title2"],
      date: new Date(),
      description: "dumb description",
      location: "Paris",
    },
  });

  beforeEach(async () => {
    metadataDb = new FakePhotoMetadataDb();
    imageDb = new FakePhotoImageDb();
    deletePhoto = new DeletePhoto(metadataDb, imageDb);
  });

  describe("photo metadata", () => {
    it("should be deleted from db", async () => {
      await metadataDb.insert(photo);
      const dbMetadataBeforeDelete = await metadataDb.getById(photo._id);

      await deletePhoto.execute(photo._id);

      expect(dbMetadataBeforeDelete).toBeDefined();
      expect(dbMetadataBeforeDelete).toEqual(photo.metadata);

      const dbMetadataAfterDelete = await metadataDb.getById(photo._id);
      expect(dbMetadataAfterDelete).toBeUndefined();

      expect.assertions(3);
    });

    it("should not be deleted if image-photo deletion failed", async () => {
      await metadataDb.insert(photo);
      imageDb.delete = jest
        .fn()
        .mockImplementationOnce(() => Promise.reject("image-deletion failed"));

      try {
        await deletePhoto.execute(photo._id);
      } catch (err) {
      } finally {
        const metadataFromDb = await metadataDb.getById(photo._id);
        expect(metadataFromDb).toBeDefined();
        expect(metadataFromDb).toEqual(photo.metadata);
        expect.assertions(2);
      }
    });
  });

  describe("photo image", () => {
    it("should be deleted from db", async () => {
      await imageDb.save(photo);
      const dbImageBeforeDelete = await imageDb.getById(photo._id);

      await deletePhoto.execute(photo._id);

      expect(dbImageBeforeDelete).toBeDefined();
      expect(dbImageBeforeDelete).toEqual(photo.imageBuffer);

      const dbImageAfterDelete = await imageDb.getById(photo._id);
      expect(dbImageAfterDelete).toBeUndefined();

      expect.assertions(3);
    });
  });
});
