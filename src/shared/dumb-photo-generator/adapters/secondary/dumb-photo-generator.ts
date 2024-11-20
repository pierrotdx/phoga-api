import { LoremIpsumGenerator } from "../../../lorem-ipsum/core";
import { UuidGenerator } from "../../../uuid";
import { DumbPhotoGenerator } from "../../core/dumb-photo-generator";

const uuidGenerator = new UuidGenerator();
const loremIpsumGenerator = new LoremIpsumGenerator();

export const dumbPhotoGenerator = new DumbPhotoGenerator(
  uuidGenerator,
  loremIpsumGenerator,
);
