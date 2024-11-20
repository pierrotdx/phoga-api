import { AssertionsCounter, IAssertionsCounter } from "@assertions-counter";
import { IPhoto, IPhotoImageDb } from "@domain";
import { dumbPhotoGenerator } from "@dumb-photo-generator";

import { PhotoImageDbGcsTestUtils } from "./photo-image-db.gcs.test-utils";

const assetImagesPaths = ["assets/test-img-1.jpg", "assets/test-img-2.jpg"];

describe("PhotoImageDbGcs", () => {
  let assertionsCounter: IAssertionsCounter;
  const testUtils = new PhotoImageDbGcsTestUtils(
    global.__GCS_API_ENDPOINT__,
    global.__GCS_PROJECT_ID__,
  );
  let photoImageDbGcs: IPhotoImageDb;

  let storedPhoto: IPhoto;

  beforeEach(async () => {
    await testUtils.internalSetup();
    photoImageDbGcs = testUtils.getPhotoImageDbGcs();

    assertionsCounter = new AssertionsCounter();
    storedPhoto = await dumbPhotoGenerator.generatePhotoFromPath(
      assetImagesPaths[0],
    );
    await testUtils.insertPhotoInDbs(storedPhoto);
  });

  afterEach(async () => {
    await testUtils.deletePhotoIfNecessary(storedPhoto._id);
  });

  describe("insert", () => {
    it("should upload the photo image to the cloud", async () => {
      const photo = dumbPhotoGenerator.generatePhoto();
      await photoImageDbGcs.insert(photo);
      await testUtils.expectImageToBeUploaded(photo);
    });
  });

  describe("checkExists", () => {
    it("should return `true` if the photo image exists in db", async () => {
      const expectedValue = true;
      const exists = await photoImageDbGcs.checkExists(storedPhoto._id);
      await testUtils.expectCheckExistValue({
        receivedValue: exists,
        expectedValue,
        assertionsCounter,
      });
      assertionsCounter.checkAssertions();
    });

    it("should return `false` if the photo image does not exist in db", async () => {
      const expectedValue = false;
      const exists = await photoImageDbGcs.checkExists("dumb id");
      await testUtils.expectCheckExistValue({
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
      storedPhotos = dumbPhotoGenerator.generatePhotos(nbPhotos);
      await testUtils.insertPhotosInDbs(storedPhotos);
    });

    afterEach(async () => {
      const photoIds = storedPhotos.map((p) => p._id);
      await testUtils.deletePhotosInDbs(photoIds);
    });

    const nbTests = 3;
    for (let i = 0; i < nbTests; i++) {
      it("should return the images required by ids", async () => {
        const ids = testUtils.pickRandomPhotoIds(storedPhotos);
        const expectedPhotos = storedPhotos.filter((p) => ids.includes(p._id));

        const result = await photoImageDbGcs.getByIds(ids);

        testUtils.expectResultToMatchPhotos(
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
      replacingPhoto = await dumbPhotoGenerator.generatePhotoFromPath(
        assetImagesPaths[1],
        storedPhoto._id,
      );
    });

    it("should replace the image of the targeted photo", async () => {
      const dbImageBefore = await testUtils.getPhotoImageFromDb(
        storedPhoto._id,
      );

      await photoImageDbGcs.replace(replacingPhoto);

      await testUtils.expectDbImageToBeReplaced({
        initPhoto: storedPhoto,
        dbImageBefore,
        replacingPhoto,
        assertionsCounter,
      });
      assertionsCounter.checkAssertions();
    });

    describe("delete", () => {
      it("should delete the targeted photo", async () => {
        const dbImageBefore = await testUtils.getPhotoImageFromDb(
          storedPhoto._id,
        );
        await photoImageDbGcs.delete(storedPhoto._id);
        await testUtils.expectDbImageToBeDeleted({
          photo: storedPhoto,
          dbImageBefore,
          assertionsCounter,
        });
        assertionsCounter.checkAssertions();
      });
    });
  });
});
