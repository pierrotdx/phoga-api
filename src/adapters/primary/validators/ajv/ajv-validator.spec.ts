import { GetPhotoSchema, IsoStringDateSchema } from "@http-server";
import { AssertionsCounter, Counter, sharedTestUtils } from "@utils";

import { UuidGenerator } from "../../uuid";
import { AjvValidator } from "./ajv-validator";
import { AjvTestUtils } from "./ajv-validator.test-utils";

const uuidGenerator = new UuidGenerator();
const ajvTestUtils = new AjvTestUtils();

describe("AjvValidator", () => {
  let ajvValidator: AjvValidator;
  let assertionsCounter: AssertionsCounter;

  beforeEach(() => {
    assertionsCounter = new AssertionsCounter();
  });

  describe("validate", () => {
    let validateSpy: jest.SpyInstance;

    it.each`
      case                  | schema                 | data
      ${"get-photo-schema"} | ${GetPhotoSchema}      | ${{ id: uuidGenerator.generate() }}
      ${"iso-string-date"}  | ${IsoStringDateSchema} | ${new Date().toISOString()}
    `("should pass with valid $case data", ({ schema, data }) => {
      ajvValidator = new AjvValidator(schema);
      validateSpy = jest.spyOn(ajvValidator, "validate");

      ajvValidator.validate(data);

      ajvTestUtils.expectCorrectInvocation({
        spy: validateSpy,
        params: [data],
        assertionsCounter: assertionsCounter,
      });
      expect(validateSpy).toHaveReturned();
      assertionsCounter.increase();
      assertionsCounter.checkAssertions();
    });

    it.each`
      case                  | schema                 | data
      ${"get-photo-schema"} | ${GetPhotoSchema}      | ${{ id: "not uuid string" }}
      ${"iso-string-date"}  | ${IsoStringDateSchema} | ${new Date().toUTCString()}
    `("should throw with invalid $case data", ({ schema, data }) => {
      ajvValidator = new AjvValidator(schema);
      validateSpy = jest.spyOn(ajvValidator, "validate");

      expect(() => {
        ajvValidator.validate(data);
      }).toThrow();
      assertionsCounter.increase();

      ajvTestUtils.expectCorrectInvocation({
        spy: validateSpy,
        params: [data],
        assertionsCounter,
      });

      assertionsCounter.checkAssertions();
    });
  });
});
