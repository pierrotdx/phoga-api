import { DbsTestUtils, IAssertionsCounter, IDbsTestUtilsParams, } from "@utils";


import { GetPhotoField, IPhoto } from "../../models";

export class GetPhotoTestUtils extends DbsTestUtils {
  constructor(dbsTestUtilsParams: IDbsTestUtilsParams) {
    super(dbsTestUtilsParams);
  }

  expectResultToMatchPhoto(
    expectedPhoto: IPhoto,
    result: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ) {
    expect(result).toBeDefined();
    expect(result._id).toBe(expectedPhoto._id);
    expect(result).toEqual(expectedPhoto);
    assertionsCounter.increase(3);
  }

  expectResultToHaveOnlyRequiredField(
    requiredField: GetPhotoField,
    result: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ) {
    if (requiredField === GetPhotoField.Metadata) {
      expect(result.metadata).toBeDefined();
      expect(result.imageBuffer).toBeUndefined();
      assertionsCounter.increase(2);
    }
    if (requiredField === GetPhotoField.ImageBuffer) {
      expect(result.imageBuffer).toBeDefined();
      expect(result.metadata).toBeUndefined();
      assertionsCounter.increase(2);
    }
  }
}
