import { isUuid } from "@shared";

import { UuidGenerator } from "./uuid-generator";

describe("UuidGenerator", () => {
  let uuidGenerator: UuidGenerator;

  beforeEach(() => {
    uuidGenerator = new UuidGenerator();
  });

  describe("generate", () => {
    const nbTests = 10;
    for (let index = 0; index < nbTests; index++) {
      it("should generate a valid uuid", () => {
        const id = uuidGenerator.generate();
        expect(isUuid(id)).toBe(true);
        expect.assertions(1);
      });
    }
  });
});
