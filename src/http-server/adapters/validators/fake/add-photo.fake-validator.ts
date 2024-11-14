import { Photo } from "@domain";
import { IValidator, imageBufferEncoding } from "@http-server";

export class AddPhotoFakeValidator implements IValidator {
  validate = (data: unknown) => {};
}
