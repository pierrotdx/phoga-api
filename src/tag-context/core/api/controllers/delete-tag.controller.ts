import { IPhotoDataDb } from "#photo-context";
import { ExpressController, IExpressController } from "#shared/express";
import { AjvValidator, IValidator } from "#shared/validators";
import { Request, Response } from "express";

import {
  DeleteTagUseCase,
  IDeleteTagParser,
  IDeleteTagUseCase,
  ITag,
  ITagDb,
} from "../../";
import { DeleteTagParser } from "../parsers";
import { DeleteTagSchema } from "../schemas";

export class DeleteTagController
  extends ExpressController<ITag["_id"]>
  implements IExpressController
{
  private readonly validator: IValidator = new AjvValidator(DeleteTagSchema);
  private readonly parser: IDeleteTagParser = new DeleteTagParser();
  private readonly useCase: IDeleteTagUseCase;

  constructor(tagDb: ITagDb, photoDataDb: IPhotoDataDb) {
    super();
    this.useCase = new DeleteTagUseCase(tagDb, photoDataDb);
  }

  protected getParamsFromRequest(req: Request): ITag["_id"] {
    this.validator.validate(req.params);
    return this.parser.parse(req);
  }

  protected async executeUseCase(...args: unknown[]): Promise<unknown> {
    return await this.useCase.execute(...args);
  }

  protected sendResponse(res: Response, ...args: unknown[]): void {
    res.status(200).json();
  }
}
