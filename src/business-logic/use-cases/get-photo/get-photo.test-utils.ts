import { IAssertionsCounter, IDbsTestUtilsParams } from "@utils";

import { GetPhotoField, IPhoto } from "../../models";
import { UseCasesSharedTestUtils } from "../use-cases.shared-test-utils";

export class GetPhotoTestUtils extends UseCasesSharedTestUtils {
  constructor(dbsTestUtilsParams: IDbsTestUtilsParams) {
    super(dbsTestUtilsParams);
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
