import { readFile } from "fs/promises";
import { omit, pick } from "ramda";

import {
  FakePhotoDataDb,
  FakePhotoImageDb,
  dumbPhotoGenerator,
} from "../../../adapters/";
import { IPhotoDataDb, IPhotoImageDb } from "../../gateways";
import { GetPhotoField, IGetPhotoUseCase, IPhoto } from "../../models";
import { PhotoTestUtils } from "../../test-utils";
import { GetPhotoUseCase } from "./get-photo";

describe(`${GetPhotoUseCase.name}`, () => {
  let photoDataDb: IPhotoDataDb;
  let photoImageDb: IPhotoImageDb;

  let testedUseCase: IGetPhotoUseCase;

  let testUtils: PhotoTestUtils<IPhoto>;

  beforeEach(async () => {
    photoDataDb = new FakePhotoDataDb();
    photoImageDb = new FakePhotoImageDb();

    testedUseCase = new GetPhotoUseCase(photoDataDb, photoImageDb);

    testUtils = new PhotoTestUtils(photoDataDb, photoImageDb, testedUseCase);
  });

  describe(`${GetPhotoUseCase.prototype.execute.name}`, () => {
    let photo: IPhoto;

    beforeEach(async () => {
      const imageBuffer = await readFile("assets/test-img-1_536x354.jpg");
      photo = await dumbPhotoGenerator.generatePhoto({ imageBuffer });
      await testUtils.insertPhotoInDb(photo);
    });

    afterEach(async () => {
      await testUtils.deletePhotoFromDb(photo._id);
    });

    it("should return the photo with matching id", async () => {
      const result = await testUtils.executeTestedUseCase(photo._id);

      testUtils.expectMatchingPhotos(photo, result);
      testUtils.checkAssertions();
    });

    it.each`
      fieldName        | fieldValue
      ${"base"}        | ${GetPhotoField.Base}
      ${"imageBuffer"} | ${GetPhotoField.ImageBuffer}
    `(
      "should return the requested photo only with the `$fieldName` property when using the option `fields: [$fieldValue]`",
      async ({ fieldValue }) => {
        const expectedPhoto =
          fieldValue === "base"
            ? omit(["imageBuffer"], photo)
            : omit(["metadata"], photo);

        const result = await testUtils.executeTestedUseCase(photo._id, {
          fields: [fieldValue],
        });

        testUtils.expectMatchingPhotos(result, expectedPhoto as IPhoto);
        testUtils.expectPhotoToHaveOnlyRequiredField(result, fieldValue);
        testUtils.checkAssertions();
      },
    );
  });
});
