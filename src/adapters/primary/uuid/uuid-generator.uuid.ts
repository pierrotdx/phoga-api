import { v4 as uuidv4 } from 'uuid';
import { IUuidGenerator } from "@utils";

export class UuidGenerator implements IUuidGenerator {
    generate(): string {
        return uuidv4();
    }
}