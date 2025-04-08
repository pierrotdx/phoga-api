import { readFile } from "fs/promises";
import { pick } from "ramda";

import {
  FakePhotoImageDb,
  FakePhotoMetadataDb,
  dumbPhotoGenerator,
} from "../../../adapters/";
import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { GetPhotoField, IGetPhotoUseCase, IPhoto } from "../../models";
import { PhotoTestUtils } from "../../test-utils";
import { GetPhotoUseCase } from "./get-photo";

describe(`${GetPhotoUseCase.name}`, () => {
  let photoMetadataDb: IPhotoMetadataDb;
  let photoImageDb: IPhotoImageDb;

  let testedUseCase: IGetPhotoUseCase;

  let testUtils: PhotoTestUtils<IPhoto>;

  beforeEach(async () => {
    photoMetadataDb = new FakePhotoMetadataDb();
    photoImageDb = new FakePhotoImageDb();

    testedUseCase = new GetPhotoUseCase(photoMetadataDb, photoImageDb);

    testUtils = new PhotoTestUtils(
      photoMetadataDb,
      photoImageDb,
      testedUseCase,
    );
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
      ${"metadata"}    | ${GetPhotoField.Metadata}
      ${"imageBuffer"} | ${GetPhotoField.ImageBuffer}
    `(
      "should return the requested photo only with the `$fieldName` property when using the option `fields: [$fieldValue]`",
      async ({ fieldValue }) => {
        const expectedPhoto = pick(["_id", fieldValue], photo);

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
