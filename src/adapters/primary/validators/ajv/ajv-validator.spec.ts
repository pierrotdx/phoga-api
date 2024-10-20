import { GetPhotoSchema, IsoStringDateSchema } from "@http-server";
import { Counter } from "@utils";

import { UuidGenerator } from "../../uuid";
import { AjvValidator } from "./ajv-validator";
import { AjvTestUtils } from "./ajv-validator.test-utils";

const uuidGenerator = new UuidGenerator();
const ajvTestUtils = new AjvTestUtils();

describe("AjvValidator", () => {
  let ajvValidator: AjvValidator;
  let assertionCounter: Counter;

  beforeEach(() => {
    assertionCounter = new Counter();
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
        assertionCounter: assertionCounter,
      });
      expect(validateSpy).toHaveReturned();
      assertionCounter.increase();
      const nbAssertions = assertionCounter.get();
      expect.assertions(nbAssertions);
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
      assertionCounter.increase();

      ajvTestUtils.expectCorrectInvocation({
        spy: validateSpy,
        params: [data],
        assertionCounter,
      });

      const nbAssertions = assertionCounter.get();
      expect.assertions(nbAssertions);
    });
  });
});
