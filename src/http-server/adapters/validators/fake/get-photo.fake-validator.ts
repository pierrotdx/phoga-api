import { IValidator } from "@http-server";

export class GetPhotoFakeValidator implements IValidator {
  validate = (data: unknown) => {};
}
