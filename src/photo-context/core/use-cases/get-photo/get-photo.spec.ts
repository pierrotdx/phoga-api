import { readFile } from "fs/promises";
import { omit, pick } from "ramda";

import {
  FakePhotoBaseDb,
  FakePhotoImageDb,
  dumbPhotoGenerator,
} from "../../../adapters/";
import { IPhotoBaseDb, IPhotoImageDb } from "../../gateways";
import { GetPhotoField, IGetPhotoUseCase, IPhoto } from "../../models";
import { PhotoTestUtils } from "../../test-utils";
import { GetPhotoUseCase } from "./get-photo";

describe(`${GetPhotoUseCase.name}`, () => {
  let photoBaseDb: IPhotoBaseDb;
  let photoImageDb: IPhotoImageDb;

  let testedUseCase: IGetPhotoUseCase;

  let testUtils: PhotoTestUtils<IPhoto>;

  beforeEach(async () => {
    photoBaseDb = new FakePhotoBaseDb();
    photoImageDb = new FakePhotoImageDb();

    testedUseCase = new GetPhotoUseCase(photoBaseDb, photoImageDb);

    testUtils = new PhotoTestUtils(photoBaseDb, photoImageDb, testedUseCase);
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
            : omit(["metadata"
              
            ], photo);

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
