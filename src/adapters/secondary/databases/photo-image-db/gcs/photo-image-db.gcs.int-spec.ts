import { IPhoto } from "@business-logic";
import { Storage } from "@google-cloud/storage";

import { getTestStorage } from "../../gcs";
import { PhotoImageDbGcs } from "./photo-image-db.gcs";
import {
  deletePhotoImage,
  generatePhoto,
  getPhotoImageBuffer,
  photoParams,
} from "./photo-image-db.gcs.int-spec.utils";

describe("PhotoImageDbGcs", () => {
  let photoImageDbGcs: PhotoImageDbGcs;
  let storage: Storage;

  beforeAll(async () => {
    storage = await getTestStorage();
  });

  beforeEach(async () => {
    photoImageDbGcs = new PhotoImageDbGcs(storage);
  });

  afterEach(async () => {
    await deletePhotoImage(storage, photoParams.id);
  });

  describe("insert", () => {
    it("should upload the photo image to the cloud", async () => {
      const photo = await generatePhoto(photoParams);
      await photoImageDbGcs.insert(photo);
      const cloudFileBuffer = await getPhotoImageBuffer(storage, photo._id);
      expect(cloudFileBuffer).toBeDefined();
      expect(cloudFileBuffer).toEqual(photo.imageBuffer);
      expect.assertions(2);
    });
  });

  describe("checkExists", () => {
    it("should return `true`(`false`) if the image does (not) exist in the cloud", async () => {
      const photo = await generatePhoto(photoParams);
      const checkExistsBefore = await photoImageDbGcs.checkExists(photo._id);
      await photoImageDbGcs.insert(photo);
      const checkExistsAfter = await photoImageDbGcs.checkExists(photo._id);
      expect(checkExistsBefore).toBe(false);
      expect(checkExistsAfter).toBe(true);
      expect.assertions(2);
    });
  });

  describe("getById", () => {
    let photo: IPhoto;

    beforeEach(async () => {
      photo = await generatePhoto(photoParams);
      await photoImageDbGcs.insert(photo);
    });

    it("should return the image buffer of the requested photo", async () => {
      const result = await photoImageDbGcs.getById(photo._id);
      expect(result).toEqual(photo.imageBuffer);
      expect.assertions(1);
    });

    it("should return `undefined` if the image buffer is not found", async () => {
      const result = await photoImageDbGcs.getById("dumb id");
      expect(result).toBeUndefined();
      expect.assertions(1);
    });
  });

  describe("replace", () => {
    let initPhoto: IPhoto;
    let replacingPhoto: IPhoto;

    beforeEach(async () => {
      initPhoto = await generatePhoto(photoParams);
      await photoImageDbGcs.insert(initPhoto);
      replacingPhoto = await generatePhoto({
        id: initPhoto._id,
        imagePath: "assets/test-img-2.jpg",
      });
    });

    it("should replace the image of the targeted photo", async () => {
      const cloudBufferBefore = await photoImageDbGcs.getById(initPhoto._id);
      await photoImageDbGcs.replace(replacingPhoto);
      const cloudBufferAfter = await photoImageDbGcs.getById(
        replacingPhoto._id,
      );
      expect(cloudBufferBefore).toEqual(initPhoto.imageBuffer);
      expect(cloudBufferAfter).not.toEqual(cloudBufferBefore);
      expect(cloudBufferAfter).toEqual(replacingPhoto.imageBuffer);
      expect(initPhoto._id).toBe(replacingPhoto._id);
      expect.assertions(4);
    });

    describe("delete", () => {
      let photo: IPhoto;
      beforeEach(async () => {
        photo = await generatePhoto(photoParams);
        await photoImageDbGcs.insert(photo);
      });

      it("should delete the targeted photo", async () => {
        const cloudBufferBefore = await photoImageDbGcs.getById(photo._id);
        await photoImageDbGcs.delete(photo._id);
        const cloudBufferAfter = await photoImageDbGcs.getById(photo._id);
        expect(cloudBufferBefore).toBeDefined();
        expect(cloudBufferBefore).toEqual(photo.imageBuffer);
        expect(cloudBufferAfter).toBeUndefined();
        expect.assertions(3);
      });
    });
  });
});
