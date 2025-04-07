import { readFile } from "fs/promises";
import { pick } from "ramda";

import {
  FakePhotoImageDb,
  FakePhotoMetadataDb,
  dumbPhotoGenerator,
} from "../../../adapters/";
import { GetPhotoField, IPhoto } from "../../models";
import { GetPhotoUseCase } from "./get-photo";
import { GetPhotoTestUtils } from "./get-photo.test-utils";

describe(`${GetPhotoUseCase.name}`, () => {
  const photoMetadataDb = new FakePhotoMetadataDb();
  const photoImageDb = new FakePhotoImageDb();
  let testUtils: GetPhotoTestUtils;

  beforeEach(async () => {
    testUtils = new GetPhotoTestUtils(photoMetadataDb, photoImageDb);
  });

  describe(`${GetPhotoUseCase.prototype.execute.name}`, () => {
    let photo: IPhoto;

    beforeEach(async () => {
      const imageBuffer = await readFile("assets/test-img-1_536x354.jpg");
      photo = await dumbPhotoGenerator.generatePhoto({ imageBuffer });
      await testUtils.insertPhotoInDbs(photo);
    });

    afterEach(async () => {
      await testUtils.deletePhotoIfNecessary(photo._id);
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
        testUtils.expectResultToHaveOnlyRequiredField(fieldValue, result);
        testUtils.checkAssertions();
      },
    );
  });
});
