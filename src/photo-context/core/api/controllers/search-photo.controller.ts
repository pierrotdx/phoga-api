import { ExpressController, IExpressController } from "#shared/express";
import { ISearchResult } from "#shared/models";
import { AjvValidator, IValidator } from "#shared/validators";
import { type Request, type Response } from "express";

import {
  IPhoto,
  IPhotoDataDb,
  IPhotoImageDb,
  ISearchPhotoOptions,
  ISearchPhotoParams,
  ISearchPhotoParser,
  ISearchPhotoUseCase,
  SearchPhotoUseCase,
} from "../..";
import { SearchPhotoParser } from "../parsers";
import { SearchPhotoSchema } from "../schemas";

export class SearchPhotoController
  extends ExpressController
  implements IExpressController
{
  private readonly useCase: ISearchPhotoUseCase;
  private readonly validator: IValidator;
  private readonly parser: ISearchPhotoParser;

  constructor(
    private readonly photoDataDb: IPhotoDataDb,
    private readonly imageDb: IPhotoImageDb,
  ) {
    super();
    this.useCase = new SearchPhotoUseCase(this.photoDataDb, this.imageDb);
    this.validator = new AjvValidator(SearchPhotoSchema);
    this.parser = new SearchPhotoParser();
  }

  protected getParamsFromRequest(req: Request): ISearchPhotoParams {
    this.validator.validate(req.query);
    const searchPhotoParams = this.parser.parse(req);
    return searchPhotoParams;
  }

  protected async executeUseCase(
    searchOptions: ISearchPhotoOptions,
  ): Promise<ISearchResult<IPhoto>> {
    return await this.useCase.execute(searchOptions);
  }

  protected sendResponse(res: Response, photos: IPhoto[]) {
    res.json(photos);
  }
}
