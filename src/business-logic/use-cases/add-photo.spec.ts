import { AddPhoto } from "./add-photo";
import { IPhoto, Photo } from "../models";
import { IPhotoImageRepository, IPhotoMetadataRepository } from "../gateways";
import {
  FakePhotoMetadataRepository,
  FakePhotoImageRepository,
} from "../../adapters";

describe("add-photo use case", () => {
  let addPhoto: AddPhoto;
  let metadataRepo: IPhotoMetadataRepository;
  let imageRepo: IPhotoImageRepository;

  let photo: IPhoto;

  beforeEach(async () => {
    metadataRepo = new FakePhotoMetadataRepository();
    imageRepo = new FakePhotoImageRepository();
    addPhoto = new AddPhoto(metadataRepo, imageRepo);

    photo = new Photo("dumb photo id", {
      metadata: {
        titles: ["title 1", "title2"],
        date: new Date(),
        description: "dumb description",
        location: "Paris",
      },
      imageBuffer: Buffer.from("dumb buffer content"),
    });
    await (imageRepo as FakePhotoImageRepository).createDir();
  });

  afterEach(async () => {
    await (imageRepo as FakePhotoImageRepository).removeDir();
  });

  describe("photo image", () => {
    it("should be uploaded to image repository", async () => {
      await addPhoto.execute(photo);

      const uploadedImageBuffer = await imageRepo.getById(photo._id);
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
    it("should be added to metadata repository", async () => {
      await addPhoto.execute(photo);

      const metadataFromRepo = await metadataRepo.getById(photo._id);
      expect(metadataFromRepo).toEqual(photo.metadata);
      expect.assertions(1);
    });

    it("should not be added if there is no image buffer", async () => {
      try {
        delete photo.imageBuffer;
        await addPhoto.execute(photo);
      } catch (err) {
        const metadataFromRepo = await metadataRepo.getById(photo._id);
        expect(metadataFromRepo).toBeUndefined();
      }
      expect.assertions(1);
    });
  });
});
