import { IPhotoDataDb } from "#photo-context";
import { ExpressController, IExpressController } from "#shared/express";
import { AjvValidator, IValidator } from "#shared/validators";
import { Request, Response } from "express";

import {
  IReplaceTagParser,
  IReplaceTagUseCase,
  ITag,
  ITagDb,
  ReplaceTagUseCase,
} from "../../";
import { ReplaceTagParser } from "../parsers";
import { ReplaceTagSchema } from "../schemas";

export class ReplaceTagController
  extends ExpressController<ITag>
  implements IExpressController
{
  private readonly validator: IValidator = new AjvValidator(ReplaceTagSchema);
  private readonly parser: IReplaceTagParser = new ReplaceTagParser();
  private readonly useCase: IReplaceTagUseCase;

  constructor(tagDb: ITagDb, photoDataDb: IPhotoDataDb) {
    super();
    this.useCase = new ReplaceTagUseCase(tagDb, photoDataDb);
  }

  protected getParamsFromRequest(req: Request): ITag {
    this.validator.validate(req.body);
    return this.parser.parse(req);
  }

  protected async executeUseCase(...args: unknown[]): Promise<unknown> {
    return await this.useCase.execute(...args);
  }

  protected sendResponse(res: Response, ...args: unknown[]): void {
    res.status(200).json();
  }
}
