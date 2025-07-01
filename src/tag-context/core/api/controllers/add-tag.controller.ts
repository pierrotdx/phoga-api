import { ExpressController, IExpressController } from "#shared/express";
import { AjvValidator, IValidator } from "#shared/validators";
import { Request, Response } from "express";

import {
  AddTagUseCase,
  IAddTagParser,
  IAddTagUseCase,
  ITag,
  ITagDb,
} from "../../";
import { AddTagParser } from "../parsers";
import { AddTagSchema } from "../schemas";

export class AddTagController
  extends ExpressController<ITag>
  implements IExpressController
{
  private readonly validator: IValidator = new AjvValidator(AddTagSchema);
  private readonly parser: IAddTagParser = new AddTagParser();
  private readonly useCase: IAddTagUseCase;

  constructor(tagDb: ITagDb) {
    super();
    this.useCase = new AddTagUseCase(tagDb);
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
