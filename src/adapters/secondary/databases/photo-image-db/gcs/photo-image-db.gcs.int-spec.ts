import { IPhoto, IPhotoImageDb } from "@business-logic";
import { Storage } from "@google-cloud/storage";
import { AssertionsCounter, IAssertionsCounter } from "@utils";

import { dumbPhotoGenerator } from "../../../../primary";
import { gcsTestUtils } from "../../gcs";
import { PhotoImageDbGcs } from "./photo-image-db.gcs";
import { PhotoImageDbGcsTestUtils } from "./photo-image-db.test-utils";

const assetImagesPaths = ["assets/test-img-1.jpg", "assets/test-img-2.jpg"];

describe("PhotoImageDbGcs", () => {
  let assertionsCounter: IAssertionsCounter;
  let photoImageDbGcsTestUtils: PhotoImageDbGcsTestUtils;
  let photoImageDbGcs: IPhotoImageDb;
  let storage: Storage;

  let storedPhoto: IPhoto;

  beforeAll(async () => {
    storage = await gcsTestUtils.getStorage();
  });

  beforeEach(async () => {
    assertionsCounter = new AssertionsCounter();
    photoImageDbGcs = new PhotoImageDbGcs(storage);
    photoImageDbGcsTestUtils = new PhotoImageDbGcsTestUtils(
      undefined,
      photoImageDbGcs,
    );
    storedPhoto = await photoImageDbGcsTestUtils.generatePhotoFromAssets(
      assetImagesPaths[0],
    );
    await photoImageDbGcsTestUtils.insertPhotoInDbs(storedPhoto);
  });

  afterEach(async () => {
    await photoImageDbGcsTestUtils.deletePhotoIfNecessary(storedPhoto._id);
  });

  describe("insert", () => {
    it("should upload the photo image to the cloud", async () => {
      const photo = dumbPhotoGenerator.generate();
      await photoImageDbGcs.insert(photo);
      await photoImageDbGcsTestUtils.expectImageToBeUploaded(photo);
    });
  });

  describe("checkExists", () => {
    it("should return `true` if the photo image exists in db", async () => {
      const expectedValue = true;
      const exists = await photoImageDbGcs.checkExists(storedPhoto._id);
      await photoImageDbGcsTestUtils.expectCheckExistValue({
        receivedValue: exists,
        expectedValue,
        assertionsCounter,
      });
      assertionsCounter.checkAssertions();
    });

    it("should return `false` if the photo image does not exist in db", async () => {
      const expectedValue = false;
      const exists = await photoImageDbGcs.checkExists("dumb id");
      await photoImageDbGcsTestUtils.expectCheckExistValue({
        receivedValue: exists,
        expectedValue,
        assertionsCounter,
      });
      assertionsCounter.checkAssertions();
    });
  });

  describe("getById", () => {
    it("should return the image buffer of the requested photo", async () => {
      const result = await photoImageDbGcs.getById(storedPhoto._id);
      expect(result).toEqual(storedPhoto.imageBuffer);
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
    let storedPhotos: IPhoto[];

    beforeEach(async () => {
      storedPhotos = photoImageDbGcsTestUtils.generatePhotos(nbPhotos);
      await photoImageDbGcsTestUtils.insertPhotosInDbs(storedPhotos);
    });

    afterEach(async () => {
      const photoIds = storedPhotos.map((p) => p._id);
      await photoImageDbGcsTestUtils.deletePhotosInDbs(photoIds);
    });

    const nbTests = 3;
    for (let i = 0; i < nbTests; i++) {
      it("should return the images required by ids", async () => {
        const ids = photoImageDbGcsTestUtils.pickRandomPhotoIds(storedPhotos);
        const expectedPhotos = storedPhotos.filter((p) => ids.includes(p._id));

        const result = await photoImageDbGcs.getByIds(ids);

        photoImageDbGcsTestUtils.expectResultToMatchPhotos(
          result,
          expectedPhotos,
          assertionsCounter,
        );
        assertionsCounter.checkAssertions();
      });
    }
  });

  describe("replace", () => {
    let replacingPhoto: IPhoto;

    beforeEach(async () => {
      replacingPhoto = await photoImageDbGcsTestUtils.generatePhotoFromAssets(
        assetImagesPaths[1],
        storedPhoto._id,
      );
    });

    it("should replace the image of the targeted photo", async () => {
      const dbImageBefore = await photoImageDbGcsTestUtils.getPhotoImageFromDb(
        storedPhoto._id,
      );

      await photoImageDbGcs.replace(replacingPhoto);

      await photoImageDbGcsTestUtils.expectDbImageToBeReplaced({
        initPhoto: storedPhoto,
        dbImageBefore,
        replacingPhoto,
        assertionsCounter,
      });
      assertionsCounter.checkAssertions();
    });

    describe("delete", () => {
      it("should delete the targeted photo", async () => {
        const dbImageBefore =
          await photoImageDbGcsTestUtils.getPhotoImageFromDb(storedPhoto._id);
        await photoImageDbGcs.delete(storedPhoto._id);
        await photoImageDbGcsTestUtils.expectDbImageToBeDeleted({
          photo: storedPhoto,
          dbImageBefore,
          assertionsCounter,
        });
        assertionsCounter.checkAssertions();
      });
    });
  });
});
