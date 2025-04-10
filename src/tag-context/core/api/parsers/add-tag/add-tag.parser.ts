import { Request } from "express";

import { IAddTagParser, ITag } from "../../../models";

export class AddTagParser implements IAddTagParser {
  parse(req: Request): ITag {
    const tag: ITag = { ...req.body };
    return tag;
  }
}
