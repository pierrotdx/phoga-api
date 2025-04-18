import {
  FakePhotoBaseDb,
  FakePhotoImageDb,
  dumbPhotoGenerator,
} from "../../../adapters/";
import { IPhotoBaseDb, IPhotoImageDb, PhotoTestUtils } from "../../../core";
import { IPhoto, IReplacePhotoUseCase } from "../../models";
import { ReplacePhotoUseCase } from "./replace-photo";

describe(`${ReplacePhotoUseCase.name}`, () => {
  let photoBaseDb: IPhotoBaseDb;
  let photoImageDb: IPhotoImageDb;

  let testedUseCase: IReplacePhotoUseCase;

  let testUtils: PhotoTestUtils;

  beforeEach(async () => {
    photoBaseDb = new FakePhotoBaseDb();
    photoImageDb = new FakePhotoImageDb();

    testedUseCase = new ReplacePhotoUseCase(photoBaseDb, photoImageDb);

    testUtils = new PhotoTestUtils(photoBaseDb, photoImageDb, testedUseCase);
  });

  describe(`${ReplacePhotoUseCase.prototype.execute.name}`, () => {
    let photoToReplace: IPhoto;
    let newPhoto: IPhoto;

    beforeEach(async () => {
      photoToReplace = await dumbPhotoGenerator.generatePhoto();
      newPhoto = await dumbPhotoGenerator.generatePhoto({
        _id: photoToReplace._id,
      });
      await testUtils.insertPhotoInDb(photoToReplace);
    });

    afterEach(async () => {
      await testUtils.deletePhotoFromDb(photoToReplace._id);
    });

    it("should replace photo base data and image in their respective DBs", async () => {
      const dbPhotoBefore = await testUtils.getPhotoFromDb(photoToReplace._id);

      await testUtils.executeTestedUseCase(newPhoto);

      await testUtils.expectPhotoToBeReplacedInDb(dbPhotoBefore, newPhoto);
      testUtils.checkAssertions();
    });

    describe("when the photo to replace only had an image and no base data in db", () => {
      beforeEach(async () => {
        await testUtils.deletePhotoBaseFromDb(photoToReplace._id);
      });

      it("should add the photo's base data in db", async () => {
        await testUtils.executeTestedUseCase(newPhoto);

        await testUtils.expectPhotoBaseToBeInDb(newPhoto);
        testUtils.checkAssertions();
      });
    });

    it.each`
      case           | imageBuffer
      ${"undefined"} | ${undefined}
      ${"null"}      | ${null}
      ${"empty"}     | ${{}}
    `(
      "should throw an error if the image buffer is `$case` and not update photo's base data",
      async ({ imageBuffer }) => {
        photoToReplace.imageBuffer = imageBuffer;
        await testUtils.executeUseCaseAndExpectToThrow(photoToReplace);
        testUtils.checkAssertions();
      },
    );

    it("should throw an error if the image to replace is not found", async () => {
      const newPhoto = await dumbPhotoGenerator.generatePhoto();
      await testUtils.executeUseCaseAndExpectToThrow(newPhoto);
      testUtils.checkAssertions();
    });
  });
});
