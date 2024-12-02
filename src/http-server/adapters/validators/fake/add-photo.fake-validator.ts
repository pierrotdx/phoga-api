import { IValidator } from "@http-server";

export class AddPhotoFakeValidator implements IValidator {
  validate = (data: unknown) => {};
}
