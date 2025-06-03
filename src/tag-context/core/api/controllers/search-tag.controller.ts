import { ExpressController, IExpressController } from "#shared/express";
import { AjvValidator, IValidator } from "#shared/validators";
import { Request, Response } from "express";

import {
  ISearchTagFilter,
  ISearchTagOptions,
  ISearchTagParser,
  ISearchTagUseCase,
  ITag,
  ITagDb,
  SearchTagParser,
  SearchTagSchema,
  SearchTagUseCase,
} from "../../";

export class SearchTagController
  extends ExpressController
  implements IExpressController
{
  private readonly useCase: ISearchTagUseCase;
  private readonly parser: ISearchTagParser = new SearchTagParser();
  private readonly validator: IValidator = new AjvValidator(SearchTagSchema);

  constructor(tagDb: ITagDb) {
    super();
    this.useCase = new SearchTagUseCase(tagDb);
  }

  protected getParamsFromRequest(req: Request): unknown | Promise<unknown> {
    this.validator.validate(req);
    return this.parser.parse(req);
  }

  protected async executeUseCase(filter?: ISearchTagFilter, options?: ISearchTagOptions): Promise<unknown> {
    return await this.useCase.execute(filter, options);
  }

  protected sendResponse(res: Response, tags: ITag[]): void {
    res.json(tags);
  }
}
