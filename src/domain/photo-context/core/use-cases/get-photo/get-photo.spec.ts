import { pick } from "ramda";

import {
  AssertionsCounter,
  IAssertionsCounter,
  dumbPhotoGenerator,
} from "@shared";

import { FakePhotoImageDb, FakePhotoMetadataDb } from "../../../adapters";
import { GetPhotoField, IPhoto } from "../../models";
import { GetPhoto } from "./get-photo";
import { GetPhotoTestUtils } from "./get-photo.test-utils";

describe(`${GetPhoto.name}`, () => {
  const photoMetadataDb = new FakePhotoMetadataDb();
  const photoImageDb = new FakePhotoImageDb();
  const testUtils = new GetPhotoTestUtils(photoMetadataDb, photoImageDb);
  const photo = dumbPhotoGenerator.generatePhoto();
  let getPhoto: GetPhoto;
  let assertionsCounter: IAssertionsCounter;

  beforeEach(async () => {
    getPhoto = new GetPhoto(testUtils.photoMetadataDb, testUtils.photoImageDb);
    assertionsCounter = new AssertionsCounter();
    await testUtils.insertPhotoInDbs(photo);
  });

  afterEach(async () => {
    await testUtils.deletePhotoIfNecessary(photo._id);
  });

  describe(`${GetPhoto.prototype.execute.name}`, () => {
    it("should return the photo with matching id", async () => {
      const result = await getPhoto.execute(photo._id);
      testUtils.expectMatchingPhotos(photo, result, assertionsCounter);
      assertionsCounter.checkAssertions();
    });

    it.each`
      fieldName        | fieldValue
      ${"metadata"}    | ${GetPhotoField.Metadata}
      ${"imageBuffer"} | ${GetPhotoField.ImageBuffer}
    `(
      "should return the requested photo only with the `$fieldName` property when using the option `fields: [$fieldValue]`",
      async ({ fieldValue }) => {
        const expectedPhoto = pick(["_id", fieldValue], photo);

        const result = await getPhoto.execute(photo._id, {
          fields: [fieldValue],
        });
        testUtils.expectMatchingPhotos(
          result,
          expectedPhoto as IPhoto,
          assertionsCounter,
        );
        testUtils.expectResultToHaveOnlyRequiredField(
          fieldValue,
          result,
          assertionsCounter,
        );
        assertionsCounter.checkAssertions();
      },
    );
  });
});
