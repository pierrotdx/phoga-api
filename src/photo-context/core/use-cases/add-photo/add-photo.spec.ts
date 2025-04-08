import { omit } from "ramda";

import {
  FakePhotoImageDb,
  FakePhotoMetadataDb,
  dumbPhotoGenerator,
} from "../../../adapters/";
import { IPhotoImageDb, IPhotoMetadataDb, PhotoTestUtils } from "../../../core";
import { IAddPhotoUseCase, IPhoto } from "../../models";
import { AddPhotoUseCase } from "./add-photo";

describe(`${AddPhotoUseCase.name}`, () => {
  let photoMetadataDb: IPhotoMetadataDb;
  let photoImageDb: IPhotoImageDb;

  let testedUseCase: IAddPhotoUseCase;

  let testUtils: PhotoTestUtils<void>;

  beforeEach(async () => {
    photoMetadataDb = new FakePhotoMetadataDb();
    photoImageDb = new FakePhotoImageDb();

    testedUseCase = new AddPhotoUseCase(photoMetadataDb, photoImageDb);

    testUtils = new PhotoTestUtils(
      photoMetadataDb,
      photoImageDb,
      testedUseCase,
    );
  });

  describe(`${AddPhotoUseCase.prototype.execute.name}`, () => {
    it("should upload photo image and metadata to their respective DBs", async () => {
      const photo = await dumbPhotoGenerator.generatePhoto();

      await testUtils.executeTestedUseCase(photo);

      await testUtils.expectPhotoToBeUploaded(photo);

      testUtils.checkAssertions();
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

        testUtils.checkAssertions();
      },
    );
  });
});
