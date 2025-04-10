import {
  AssertionsCounter,
  IAssertionsCounter,
} from "#shared/assertions-counter";
import { LoremIpsumGenerator } from "#shared/lorem-ipsum";
import { UuidGenerator } from "#shared/uuid";
import { Request, Response } from "express";

import { AddPhotoParser } from "./add-photo.parser";
import { AddPhotoParserTestUtils } from "./add-photo.parser.test-utils";

const uuidGenerator = new UuidGenerator();
const loremIpsum = new LoremIpsumGenerator();
const testUtils = new AddPhotoParserTestUtils(uuidGenerator, loremIpsum);

describe("AddPhotoParser", () => {
  let addPhotoParser: AddPhotoParser;
  let assertionsCounter: IAssertionsCounter;

  beforeEach(() => {
    addPhotoParser = new AddPhotoParser();
    assertionsCounter = new AssertionsCounter();
  });

  describe("parse", () => {
    it("should parse input data into photo", async () => {
      const inputData = await testUtils.generateValidData();
      const reqHandler = async (req: Request, res: Response) => {
        const parsedData = await addPhotoParser.parse(req);
        testUtils.expectParsedDataToBeAValidPhotoWithInputFields(
          inputData,
          parsedData,
          assertionsCounter,
        );
        res.status(200).json();
      };
      testUtils.setReqHandler(reqHandler);
      await testUtils.sendRequest(inputData);

      // making sure the expectations from the reqHandler are taken into account
      expect(assertionsCounter.get()).toBeGreaterThan(0);
      assertionsCounter.increase();
      assertionsCounter.checkAssertions();
    });

    it("should throw if the parsed data is not a photo", async () => {
      const invalidData = await testUtils.generateValidData();
      invalidData.location = ["test", "test2"] as any;
      const reqHandler = async (req: Request, res: Response) => {
        try {
          await addPhotoParser.parse(invalidData);
        } catch (err) {
          expect(err).toBeDefined();
        } finally {
          assertionsCounter.increase();
          res.status(200).json();
        }
      };
      testUtils.setReqHandler(reqHandler);
      await testUtils.sendRequest(invalidData);

      // making sure the expectations from the reqHandler are taken into account
      expect(assertionsCounter.get()).toBeGreaterThan(0);
      assertionsCounter.increase();
      assertionsCounter.checkAssertions();
    });
  });
});
