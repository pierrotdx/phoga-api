import { Request } from "express";
import { IGetPhotoSchema, IGetPhotoValidator, TSchema } from "../../models";

export class GetPhotoFakeValidator implements IGetPhotoValidator {
  parse(schema: TSchema, req: Request): IGetPhotoSchema {
    return { id: req?.params["id"] };
  }
}
