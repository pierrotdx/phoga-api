import { readFile } from "fs/promises";
import { pick } from "ramda";

import { AssertionsCounter, IAssertionsCounter } from "@assertions-counter";
import { dumbPhotoGenerator } from "@dumb-photo-generator";
import { ImageEditor, ImageSize } from "@shared";

import {
  FakePhotoImageDb,
  FakePhotoMetadataDb,
} from "../../../adapters/secondary";
import { GetPhotoField, IPhoto } from "../../models";
import { GetPhoto } from "./get-photo";
import { GetPhotoTestUtils } from "./get-photo.test-utils";

describe(`${GetPhoto.name}`, () => {
  const photoMetadataDb = new FakePhotoMetadataDb();
  const photoImageDb = new FakePhotoImageDb();
  const imageEditor = new ImageEditor();
  const testUtils = new GetPhotoTestUtils(photoMetadataDb, photoImageDb);
  let getPhoto: GetPhoto;
  let photo: IPhoto;
  let assertionsCounter: IAssertionsCounter;

  beforeEach(async () => {
    getPhoto = new GetPhoto(
      testUtils.photoMetadataDb,
      testUtils.photoImageDb,
      imageEditor,
    );
    assertionsCounter = new AssertionsCounter();
    const imageBuffer = await readFile("assets/test-img-1_536x354.jpg");
    photo = await dumbPhotoGenerator.generatePhoto({ imageBuffer });
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

    it.each`
      expectedSize
      ${{ width: 456, height: 789 }}
      ${{ width: 156, height: 874 }}
      ${{ width: 249, height: 697 }}
    `(
      "should return the photo with the image matching the requested size",
      async ({ expectedSize }: { expectedSize: ImageSize }) => {
        const result = await getPhoto.execute(photo._id, {
          fields: [GetPhotoField.ImageBuffer],
          imageSize: expectedSize,
        });
        const resultSize = imageEditor.getSize(result.imageBuffer);
        expect(resultSize).toEqual(expectedSize);
        expect.assertions(1);
      },
    );
  });
});
