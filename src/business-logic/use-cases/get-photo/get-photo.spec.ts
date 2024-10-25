import { pick } from "ramda";

import { FakePhotoImageDb, FakePhotoMetadataDb } from "@adapters";
import { dumbPhotoGenerator } from "@adapters";
import { AssertionsCounter, IAssertionsCounter } from "@utils";

import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { GetPhotoField, IPhoto } from "../../models";
import { GetPhoto } from "./get-photo";
import { GetPhotoTestUtils } from "./get-photo.test-utils";

describe("get-photo use case", () => {
  const photo = dumbPhotoGenerator.generatePhoto();
  let assertionsCounter: IAssertionsCounter;
  let getPhoto: GetPhoto;
  let metadataDb: IPhotoMetadataDb;
  let imageDb: IPhotoImageDb;
  let getPhotoTestUtils: GetPhotoTestUtils;

  beforeEach(async () => {
    assertionsCounter = new AssertionsCounter();
    metadataDb = new FakePhotoMetadataDb();
    imageDb = new FakePhotoImageDb();
    getPhoto = new GetPhoto(metadataDb, imageDb);
    getPhotoTestUtils = new GetPhotoTestUtils(metadataDb, imageDb);

    await getPhotoTestUtils.insertPhotoInDbs(photo);
  });

  it("should return the photo with matching id", async () => {
    const result = await getPhoto.execute(photo._id);
    getPhotoTestUtils.expectResultToMatchPhoto(
      photo,
      result,
      assertionsCounter,
    );
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

      getPhotoTestUtils.expectResultToMatchPhoto(
        result,
        expectedPhoto as IPhoto,
        assertionsCounter,
      );
      getPhotoTestUtils.expectResultToHaveOnlyRequiredField(
        fieldValue,
        result,
        assertionsCounter,
      );
      assertionsCounter.checkAssertions();
    },
  );
});
