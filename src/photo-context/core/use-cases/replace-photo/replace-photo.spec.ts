import {
  FakePhotoImageDb,
  FakePhotoMetadataDb,
  dumbPhotoGenerator,
} from "../../../adapters/";
import { IPhotoImageDb, IPhotoMetadataDb, PhotoTestUtils } from "../../../core";
import { IPhoto, IReplacePhotoUseCase } from "../../models";
import { ReplacePhotoUseCase } from "./replace-photo";

describe(`${ReplacePhotoUseCase.name}`, () => {
  let photoMetadataDb: IPhotoMetadataDb;
  let photoImageDb: IPhotoImageDb;

  let testedUseCase: IReplacePhotoUseCase;

  let testUtils: PhotoTestUtils;

  beforeEach(async () => {
    photoMetadataDb = new FakePhotoMetadataDb();
    photoImageDb = new FakePhotoImageDb();

    testedUseCase = new ReplacePhotoUseCase(photoMetadataDb, photoImageDb);

    testUtils = new PhotoTestUtils(
      photoMetadataDb,
      photoImageDb,
      testedUseCase,
    );
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

    it("should replace photo metadata and image in their respective DBs", async () => {
      const dbPhotoBefore = await testUtils.getPhotoFromDb(photoToReplace._id);

      await testUtils.executeTestedUseCase(newPhoto);

      await testUtils.expectPhotoToBeReplacedInDb(dbPhotoBefore, newPhoto);
      testUtils.checkAssertions();
    });

    describe("when the photo to replace only had an image and no metadata in db", () => {
      beforeEach(async () => {
        await testUtils.deletePhotoMetadataFromDb(photoToReplace._id);
      });

      it("should add the metadata in db", async () => {
        await testUtils.executeTestedUseCase(newPhoto);

        await testUtils.expectPhotoMetadataToBeInDb(newPhoto);
        testUtils.checkAssertions();
      });
    });

    it.each`
      case           | imageBuffer
      ${"undefined"} | ${undefined}
      ${"null"}      | ${null}
      ${"empty"}     | ${{}}
    `(
      "should throw an error if the image buffer is `$case` and not update metadata",
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
