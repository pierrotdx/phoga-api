import { randomInt } from "node:crypto";

import { dumbPhotoGenerator } from "@adapters";
import { IPhoto } from "@business-logic";
import { Storage } from "@google-cloud/storage";
import { DbsTestUtils } from "@utils";

import { gcsTestUtils } from "../../gcs";
import { PhotoImageDbGcs } from "./photo-image-db.gcs";
import {
  deletePhotoImage,
  generatePhoto,
  getPhotoImageBuffer,
  photoParams,
} from "./test-utils.photo-image-db";

describe("PhotoImageDbGcs", () => {
  let dbsTestUtils: DbsTestUtils;
  let photoImageDbGcs: PhotoImageDbGcs;
  let storage: Storage;

  beforeAll(async () => {
    storage = await gcsTestUtils.getStorage();
  });

  beforeEach(async () => {
    photoImageDbGcs = new PhotoImageDbGcs(storage);
    dbsTestUtils = new DbsTestUtils(undefined, photoImageDbGcs);
  });

  afterEach(async () => {
    await deletePhotoImage(storage, photoParams.id);
  });

  describe("insert", () => {
    it("should upload the photo image to the cloud", async () => {
      const photo = await generatePhoto(photoParams);
      await dbsTestUtils.insertPhotoInDbs(photo);
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
      await dbsTestUtils.insertPhotoInDbs(photo);
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
      await dbsTestUtils.insertPhotoInDbs(photo);
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

  describe("getByIds", () => {
    const nbPhotos = 6;
    const storedPhotos = generatePhotos(nbPhotos);

    beforeEach(async () => {
      await dbsTestUtils.insertPhotosInDbs(storedPhotos);
    });

    afterEach(async () => {
      const photoIds = storedPhotos.map((p) => p._id);
      await dbsTestUtils.deletePhotosInDbs(photoIds);
    });

    it.each`
      photoIndices
      ${generateRandomIndices(nbPhotos)}
      ${generateRandomIndices(nbPhotos)}
      ${generateRandomIndices(nbPhotos)}
      ${generateRandomIndices(nbPhotos)}
    `(
      "should return the images whose names match input ids",
      async ({ photoIndices }: { photoIndices: number[] }) => {
        const ids = getPhotoIdsFromIndices(storedPhotos, photoIndices);
        const result = await photoImageDbGcs.getByIds(ids);
        shouldReturnPhotoImagesMatchingInputIds(result, storedPhotos);
      },
    );
  });

  describe("replace", () => {
    let initPhoto: IPhoto;
    let replacingPhoto: IPhoto;

    beforeEach(async () => {
      initPhoto = await generatePhoto(photoParams);
      await dbsTestUtils.insertPhotoInDbs(initPhoto);
      replacingPhoto = await generatePhoto({
        id: initPhoto._id,
        imagePath: "assets/test-img-2.jpg",
      });
    });

    it("should replace the image of the targeted photo", async () => {
      const cloudBufferBefore = await dbsTestUtils.getPhotoImageFromDb(
        initPhoto._id,
      );
      await photoImageDbGcs.replace(replacingPhoto);
      const cloudBufferAfter = await dbsTestUtils.getPhotoImageFromDb(
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
        await dbsTestUtils.insertPhotoInDbs(photo);
      });

      it("should delete the targeted photo", async () => {
        const cloudBufferBefore = await dbsTestUtils.getPhotoImageFromDb(
          photo._id,
        );
        await photoImageDbGcs.delete(photo._id);
        const cloudBufferAfter = await dbsTestUtils.getPhotoImageFromDb(
          photo._id,
        );
        expect(cloudBufferBefore).toBeDefined();
        expect(cloudBufferBefore).toEqual(photo.imageBuffer);
        expect(cloudBufferAfter).toBeUndefined();
        expect.assertions(3);
      });
    });
  });
});

function shouldReturnPhotoImagesMatchingInputIds(
  result: Record<IPhoto["_id"], Buffer>,
  storedPhotos: IPhoto[],
) {
  const idBufferPairs = Object.entries(result);
  expect(idBufferPairs.length).toBeGreaterThan(0);
  idBufferPairs.forEach(([id, buffer]) => {
    expect(buffer).toBeDefined();
    const storedPhoto = storedPhotos.find((p) => p._id === id);
    expect(buffer).toEqual(storedPhoto.imageBuffer);
  });
  expect.assertions(2 * idBufferPairs.length + 1);
}

function generatePhotos(nbPhotos: number): IPhoto[] {
  const photos: IPhoto[] = [];
  for (let index = 0; index < nbPhotos; index++) {
    photos.push(
      dumbPhotoGenerator.generate({
        imageBuffer: Buffer.from("dumb image buffer"),
      }),
    );
  }
  return photos;
}

function generateRandomIndices(nbPhotos: number): number[] {
  const nbIndices = randomInt(1, nbPhotos + 1);
  const indices: number[] = [];
  while (indices.length < nbIndices - 1) {
    const index = randomInt(0, nbPhotos - 1);
    if (!indices.includes(index)) {
      indices.push(index);
    }
  }
  return indices;
}

function getPhotoIdsFromIndices(
  photos: IPhoto[],
  indices: number[],
): IPhoto["_id"][] {
  return indices.reduce<IPhoto["_id"][]>((acc, index) => {
    const photo = photos[index];
    if (photo) {
      acc.push(photo._id);
    }
    return acc;
  }, []);
}
