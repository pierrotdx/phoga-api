import { LoremIpsumGenerator, UuidGenerator } from "@adapters";
import { isPhoto } from "@utils";

import {
  IDumbPhotoGenerator,
  IDumbPhotoGeneratorOptions,
  ILoremIpsumGenerator,
  IUuidGenerator,
} from "../models";
import { DumbPhotoGenerator } from "./dumb-photo-generator";

describe("dumbPhotoGenerator", () => {
  let dumbPhotoGenerator: IDumbPhotoGenerator;
  let uuidGenerator: IUuidGenerator;
  let loremIpsumGenerator: ILoremIpsumGenerator;

  beforeEach(() => {
    uuidGenerator = new UuidGenerator();
    loremIpsumGenerator = new LoremIpsumGenerator();
    dumbPhotoGenerator = new DumbPhotoGenerator(
      uuidGenerator,
      loremIpsumGenerator,
    );
  });

  describe("generate", () => {
    const nbTests = 5;
    for (let index = 0; index < nbTests; index++) {
      it("should generate a valid photo", () => {
        const photo = dumbPhotoGenerator.generate();
        expect(isPhoto(photo)).toBe(true);
        expect.assertions(1);
      });
    }

    it("should generate a photo matching the input id", () => {
      const _id = "d90de24d-2c6b-4ce3-9733-7749d485ee87";
      const photo = dumbPhotoGenerator.generate({ _id });
      expect(photo._id).toEqual(_id);
      expect(isPhoto(photo)).toBe(true);
      expect.assertions(2);
    });

    it("should generate a photo matching the input imageBuffer", () => {
      const options: IDumbPhotoGeneratorOptions = {
        imageBuffer: Buffer.from("a test of a different image buffer"),
      };
      const photo = dumbPhotoGenerator.generate(options);
      expect(photo.imageBuffer).toEqual(options.imageBuffer);
      expect(isPhoto(photo)).toBe(true);
      expect.assertions(2);
    });

    it("should generate a photo matching the input metadata.date", () => {
      const options: IDumbPhotoGeneratorOptions = {
        date: new Date(),
      };
      const photo = dumbPhotoGenerator.generate(options);
      expect(photo.metadata?.date).toEqual(options.date);
      expect(isPhoto(photo)).toBe(true);
      expect.assertions(2);
    });

    it("should generate a photo matching the input metadata.location", () => {
      const options: IDumbPhotoGeneratorOptions = {
        location: "dumb location",
      };
      const photo = dumbPhotoGenerator.generate(options);
      expect(photo.metadata?.location).toEqual(options.location);
      expect(isPhoto(photo)).toBe(true);
      expect.assertions(2);
    });

    it("should generate a photo matching the input metadata.titles", () => {
      const options: IDumbPhotoGeneratorOptions = {
        titles: ["dumb title1", "dumb title 2"],
      };
      const photo = dumbPhotoGenerator.generate(options);
      expect(photo.metadata?.titles).toEqual(options.titles);
      expect(isPhoto(photo)).toBe(true);
      expect.assertions(2);
    });

    it("should generate a photo matching the input metadata.description", () => {
      const options: IDumbPhotoGeneratorOptions = {
        description: "dumb description",
      };
      const photo = dumbPhotoGenerator.generate(options);
      expect(photo.metadata?.description).toEqual(options.description);
      expect(isPhoto(photo)).toBe(true);
      expect.assertions(2);
    });
  });
});
