import { Request } from "express";

import { IGetTagParser, ITag } from "../../../";

export class GetTagParser implements IGetTagParser {
  parse(req: Request): string {
    const id: ITag["_id"] = req.params.id;
    return id;
  }
}
