import { omit } from "ramda";

import {
  FakePhotoBaseDb,
  FakePhotoImageDb,
  dumbPhotoGenerator,
} from "../../../adapters/";
import { IPhotoBaseDb, IPhotoImageDb, PhotoTestUtils } from "../../../core";
import { IAddPhotoUseCase, IPhoto } from "../../models";
import { AddPhotoUseCase } from "./add-photo";

describe(`${AddPhotoUseCase.name}`, () => {
  let photoBaseDb: IPhotoBaseDb;
  let photoImageDb: IPhotoImageDb;

  let testedUseCase: IAddPhotoUseCase;

  let testUtils: PhotoTestUtils<void>;

  beforeEach(async () => {
    photoBaseDb = new FakePhotoBaseDb();
    photoImageDb = new FakePhotoImageDb();

    testedUseCase = new AddPhotoUseCase(photoBaseDb, photoImageDb);

    testUtils = new PhotoTestUtils(photoBaseDb, photoImageDb, testedUseCase);
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
