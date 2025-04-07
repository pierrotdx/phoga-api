import {
  FakePhotoImageDb,
  FakePhotoMetadataDb,
  dumbPhotoGenerator,
} from "../../../adapters/";
import { IPhoto } from "../../models";
import { ReplacePhotoUseCase } from "./replace-photo";
import { ReplacePhotoTestUtils } from "./replace-photo.test-utils";

describe(`${ReplacePhotoUseCase.name}`, () => {
  const photoMetadataDb = new FakePhotoMetadataDb();
  const photoImageDb = new FakePhotoImageDb();
  let testUtils: ReplacePhotoTestUtils;

  beforeEach(async () => {
    testUtils = new ReplacePhotoTestUtils(photoMetadataDb, photoImageDb);
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
      await testUtils.deletePhotoIfNecessary(photoToReplace._id);
    });

    it("should replace photo metadata and image in their respective DBs", async () => {
      const dbPhotoBefore = await testUtils.getPhotoFromDb(photoToReplace._id);

      await testUtils.executeTestedUseCase(newPhoto);

      await testUtils.expectPhotoToBeReplacedInDb(dbPhotoBefore, newPhoto);
    });

    describe("when the photo to replace only had an image and no metadata in db", () => {
      beforeEach(async () => {
        await testUtils.deletePhotoMetadata(photoToReplace._id);
      });

      it("should add the metadata in db", async () => {
        await testUtils.executeTestedUseCase(newPhoto);

        await testUtils.expectPhotoMetadataToBeInDb(newPhoto);
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
      },
    );

    it("should throw an error if the image to replace is not found", async () => {
      const newPhoto = await dumbPhotoGenerator.generatePhoto();
      await testUtils.executeUseCaseAndExpectToThrow(newPhoto);
    });
  });
});
