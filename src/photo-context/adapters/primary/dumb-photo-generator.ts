import { LoremIpsumGenerator } from "@shared/lorem-ipsum";
import { UuidGenerator } from "@shared/uuid";

import { DumbPhotoGenerator } from "../../core";

const uuidGenerator = new UuidGenerator();
const loremIpsumGenerator = new LoremIpsumGenerator();

export const dumbPhotoGenerator = new DumbPhotoGenerator(
  uuidGenerator,
  loremIpsumGenerator,
);
