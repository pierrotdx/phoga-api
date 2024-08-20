import { Request } from "express";
import { IGetPhotoValidator, TSchema } from "../../../../models";
import { IPhoto } from "../../../../../../../business-logic";

export class GetPhotoFakeValidator implements IGetPhotoValidator {
  parse(schema: TSchema, req: Request): IPhoto["_id"] {
    return req?.params["id"];
  }
}
