import { omit } from "ramda";

import {
  FakePhotoDataDb,
  FakePhotoImageDb,
  dumbPhotoGenerator,
} from "../../../adapters/";
import { IPhotoDataDb, IPhotoImageDb, PhotoTestUtils } from "../../../core";
import { IAddPhotoUseCase, IPhoto } from "../../models";
import { AddPhotoUseCase } from "./add-photo";

describe(`${AddPhotoUseCase.name}`, () => {
  let photoDataDb: IPhotoDataDb;
  let photoImageDb: IPhotoImageDb;

  let testedUseCase: IAddPhotoUseCase;

  let testUtils: PhotoTestUtils<void>;

  beforeEach(async () => {
    photoDataDb = new FakePhotoDataDb();
    photoImageDb = new FakePhotoImageDb();

    testedUseCase = new AddPhotoUseCase(photoDataDb, photoImageDb);

    testUtils = new PhotoTestUtils(photoDataDb, photoImageDb, testedUseCase);
  });

  describe(`${AddPhotoUseCase.prototype.execute.name}`, () => {
    it("should upload photo image and data to their respective DBs", async () => {
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
      "should throw if image buffer is `$case` and not upload photo data",
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
