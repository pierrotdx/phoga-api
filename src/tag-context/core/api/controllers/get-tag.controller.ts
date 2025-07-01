import { ExpressController, IExpressController } from "#shared/express";
import { AjvValidator, IValidator } from "#shared/validators";
import { Request, Response } from "express";

import { GetTagUseCase, IGetTagParser, IGetTagUseCase, ITag, ITagDb } from "../../";
import { GetTagParser } from "../parsers";
import { GetTagSchema } from "../schemas";

export class GetTagController
  extends ExpressController<ITag["_id"]>
  implements IExpressController
{
  private readonly validator: IValidator = new AjvValidator(GetTagSchema);
  private readonly parser: IGetTagParser = new GetTagParser();
  private readonly useCase: IGetTagUseCase;

  constructor(tagDb: ITagDb) {
    super();
    this.useCase = new GetTagUseCase(tagDb);
  }

  protected  getParamsFromRequest(req: Request): ITag["_id"] {
    this.validator.validate(req.params);
    return this.parser.parse(req);
  }

  protected async executeUseCase(...args: unknown[]): Promise<unknown> {
    return await this.useCase.execute(...args);
  }

  protected sendResponse(res: Response, ...args: unknown[]): void {
    res.json(...args);
  }
}
