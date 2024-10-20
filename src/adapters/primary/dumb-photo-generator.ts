import { DumbPhotoGenerator } from "@utils";

import { LoremIpsumGenerator } from "./lorem-ipsum";
import { UuidGenerator } from "./uuid";

const uuidGenerator = new UuidGenerator();
const loremIpsumGenerator = new LoremIpsumGenerator();
export const dumbPhotoGenerator = new DumbPhotoGenerator(
  uuidGenerator,
  loremIpsumGenerator,
);
