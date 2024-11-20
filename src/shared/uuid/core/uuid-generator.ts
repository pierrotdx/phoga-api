import { v4 as uuidv4 } from "uuid";

import { IUuidGenerator } from "./models";

export class UuidGenerator implements IUuidGenerator {
  generate(): string {
    return uuidv4();
  }
}
