import { omit } from "ramda";

import {
  FakePhotoImageDb,
  FakePhotoMetadataDb,
  dumbPhotoGenerator,
} from "../../../adapters/";
import { IPhoto } from "../../models";
import { AddPhotoUseCase } from "./add-photo";
import { AddPhotoTestUtils } from "./add-photo.test-utils";

describe(`${AddPhotoUseCase.name}`, () => {
  const photoMetadataDb = new FakePhotoMetadataDb();
  const photoImageDb = new FakePhotoImageDb();
  let testUtils: AddPhotoTestUtils;

  beforeEach(async () => {
    testUtils = new AddPhotoTestUtils(photoMetadataDb, photoImageDb);
  });

  describe(`${AddPhotoUseCase.prototype.execute.name}`, () => {
    it("should upload photo image and metadata to their respective DBs", async () => {
      const photo = await dumbPhotoGenerator.generatePhoto();

      await testUtils.executeTestedUseCase(photo);

      await testUtils.expectPhotoToBeUploaded(photo);
    });

    it.each`
      case           | imageBuffer
      ${"undefined"} | ${undefined}
      ${"null"}      | ${null}
      ${"empty"}     | ${{}}
    `(
      "should throw if image buffer is `$case` and not upload metadata",
      async ({ imageBuffer }) => {
        const photo = await dumbPhotoGenerator.generatePhoto();
        const photoWithInvalidImage = omit(["imageBuffer"], photo) as IPhoto;
        photoWithInvalidImage.imageBuffer = imageBuffer;

        await testUtils.executeUseCaseAndExpectToThrow(photoWithInvalidImage);
      },
    );
  });
});
