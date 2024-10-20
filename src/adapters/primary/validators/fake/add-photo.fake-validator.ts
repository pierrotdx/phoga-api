import { Photo } from "@business-logic";
import { IValidator, imageBufferEncoding } from "@http-server";

export class AddPhotoFakeValidator implements IValidator {
  validate = (data: unknown) => {};
}
