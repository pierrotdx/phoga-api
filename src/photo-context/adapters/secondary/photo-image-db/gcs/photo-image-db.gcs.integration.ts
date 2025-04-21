import {
  AssertionsCounter,
  IAssertionsCounter,
} from "#shared/assertions-counter";
import {
  IPhotoDbTestUtils,
  IPhotoExpectsTestUtils,
  PhotoDbTestUtils,
  PhotoExpectsTestUtils,
} from "#shared/test-utils";

import { dumbPhotoGenerator } from "../../../../adapters";
import { IPhoto, IPhotoImageDb } from "../../../../core";
import { PhotoImageDbGcsTestUtils } from "./photo-image-db.gcs.test-utils";

describe("PhotoImageDbGcs", () => {
  const testUtils = new PhotoImageDbGcsTestUtils(
    global.__GCS_API_ENDPOINT__,
    global.__GCS_PROJECT_ID__,
    global.__GC_PHOTO_IMAGES_BUCKET__,
  );
  let photoImageDbGcs: IPhotoImageDb;

  let dbTestUtils: IPhotoDbTestUtils;
  let expectsTestUtils: IPhotoExpectsTestUtils;

  const timeout = 10000;

  beforeEach(async () => {
    await testUtils.globalSetup();
    photoImageDbGcs = testUtils.getPhotoImageDbGcs();

    dbTestUtils = new PhotoDbTestUtils(undefined, photoImageDbGcs);
    expectsTestUtils = new PhotoExpectsTestUtils(dbTestUtils);
  });

  describe("insert", () => {
    let photoToInsert: IPhoto;

    beforeEach(async () => {
      photoToInsert = await dumbPhotoGenerator.generatePhoto();
    });

    afterEach(async () => {
      await dbTestUtils.deletePhoto(photoToInsert._id);
    });

    it("should upload the photo image to the db", async () => {
      const expectedImage = photoToInsert.imageBuffer;

      await photoImageDbGcs.insert(photoToInsert);

      await expectsTestUtils.expectPhotoImageToBe(photoToInsert._id, expectedImage);
      expectsTestUtils.checkAssertions();
    });
  });

  describe("checkExists", () => {
    describe("when the image does not exist in db", () => {
      it("should return `false`", async () => {
        const result = await photoImageDbGcs.checkExists("inexistent id");

        expect(result).toBe(false);
        expect.assertions(1);
      });
    });

    describe("when the image exists in db", () => {
      let photoToCheck: IPhoto;

      beforeEach(async () => {
        photoToCheck = await dumbPhotoGenerator.generatePhoto();
        await dbTestUtils.addPhoto(photoToCheck);
      });

      afterEach(async () => {
        await dbTestUtils.deletePhoto(photoToCheck._id);
      });

      it("should return `true`", async () => {
        const result = await photoImageDbGcs.checkExists(photoToCheck._id);

        expect(result).toBe(true);
        expect.assertions(1);
      });
    });
  });

  describe("getById", () => {
    describe("when the image does not exist in db", () => {
      it("should return `undefined`", async () => {
        const result = await photoImageDbGcs.getById("dumb id");

        expect(result).toBeUndefined();
        expect.assertions(1);
      });
    });

    describe("when the image exists in db", () => {
      let photoToGet: IPhoto;

      beforeEach(async () => {
        photoToGet = await dumbPhotoGenerator.generatePhoto();
        await dbTestUtils.addPhoto(photoToGet);
      });

      afterEach(async () => {
        await dbTestUtils.deletePhoto(photoToGet._id);
      });

      it("should return the image buffer of the requested photo", async () => {
        const expectedImage = photoToGet.imageBuffer;

        const result = await photoImageDbGcs.getById(photoToGet._id);

        expect(result).toEqual(expectedImage);
        expect.assertions(1);
      });
    });
  });

  describe("getByIds", () => {
    const nbPhotos = 6;
    let storedPhotos: IPhoto[];

    beforeEach(async () => {
      storedPhotos = await dumbPhotoGenerator.generatePhotos(nbPhotos);
      await dbTestUtils.addPhotos(storedPhotos);
    }, timeout);

    afterEach(async () => {
      const photoIds = storedPhotos.map((p) => p._id);
      await dbTestUtils.deletePhotos(photoIds);
    }, timeout);

    const nbTests = 3;
    for (let i = 0; i < nbTests; i++) {
      it("should return the required images", async () => {
        const ids = testUtils.pickRandomPhotoIds(storedPhotos);
        const expectedPhotos = storedPhotos.filter((p) => ids.includes(p._id));

        const result = await photoImageDbGcs.getByIds(ids);

        const assertionsCounter: IAssertionsCounter = new AssertionsCounter();

        expect(expectedPhotos.length).toBe(Object.keys(result).length);
        assertionsCounter.increase();

        Object.entries(result).forEach(([id, image]) => {
          const expectedImage = expectedPhotos.find(
            (p) => p._id === id,
          ).imageBuffer;
          expect(image).toEqual(expectedImage);
          assertionsCounter.increase();
        });

        assertionsCounter.checkAssertions();
      });
    }
  });

  describe("replace", () => {
    let photoToReplace: IPhoto;

    beforeEach(async () => {
      photoToReplace = await dumbPhotoGenerator.generatePhoto();
      await dbTestUtils.addPhoto(photoToReplace);
    });

    afterEach(async () => {
      await dbTestUtils.deletePhoto(photoToReplace._id);
    });

    it("should replace the image of the required photo", async () => {
      const newPhoto = await dumbPhotoGenerator.generatePhoto({
        _id: photoToReplace._id,
      });
      const expectedImage = newPhoto.imageBuffer;

      await photoImageDbGcs.replace(newPhoto);

      await expectsTestUtils.expectPhotoImageToBe(
        photoToReplace._id,
        expectedImage,
      );
      expectsTestUtils.checkAssertions();
    });
  });

  describe("delete", () => {
    let photoToDelete: IPhoto;

    beforeEach(async () => {
      photoToDelete = await dumbPhotoGenerator.generatePhoto();
      await dbTestUtils.addPhoto(photoToDelete);
    });

    afterEach(async () => {
      await dbTestUtils.deletePhoto(photoToDelete._id);
    });

    it("should delete the required photo", async () => {
      await photoImageDbGcs.delete(photoToDelete._id);

      await expectsTestUtils.expectPhotoImageToBe(photoToDelete._id, undefined);
      expectsTestUtils.checkAssertions();
    });
  });
});
