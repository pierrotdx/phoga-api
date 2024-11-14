import { IValidator } from "@http-server";

export class DeletePhotoFakeValidator implements IValidator {
  validate = (data: unknown) => {};
}
