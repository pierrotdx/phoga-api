import { Request } from "express";
import { IDeletePhotoValidator, TSchema } from "../../models";
import { IPhoto } from "../../../../../business-logic";

export class DeletePhotoFakeValidator implements IDeletePhotoValidator {
  parse(schema: TSchema, req: Request): IPhoto["_id"] {
    return req.params["id"];
  }
}
