import { ExpressController, IExpressController } from "#shared/express";
import { AjvValidator, IValidator } from "#shared/validators";
import { type Request, type Response } from "express";

import {
  IPhoto,
  IPhotoImageDb,
  IPhotoMetadataDb,
  ISearchPhotoOptions,
  ISearchPhotoParser,
  ISearchPhotoUseCase,
  SearchPhotoUseCase,
} from "../..";
import { SearchPhotoParser } from "../parsers";
import { GetPhotoSchema, SearchPhotoSchema } from "../schemas";

export class SearchPhotoController
  extends ExpressController
  implements IExpressController
{
  private readonly useCase: ISearchPhotoUseCase;
  private readonly validator: IValidator;
  private readonly parser: ISearchPhotoParser;

  constructor(
    private readonly metadataDb: IPhotoMetadataDb,
    private readonly imageDb: IPhotoImageDb,
  ) {
    super();
    this.useCase = new SearchPhotoUseCase(this.metadataDb, this.imageDb);
    this.validator = new AjvValidator(SearchPhotoSchema);
    this.parser = new SearchPhotoParser();
  }

  protected getParamsFromRequest(req: Request): ISearchPhotoOptions {
    this.validator.validate(req.query);
    const searchOptions = this.parser.parse(req.query);
    return searchOptions;
  }

  protected async executeUseCase(
    searchOptions: ISearchPhotoOptions,
  ): Promise<IPhoto[]> {
    return await this.useCase.execute(searchOptions);
  }

  protected sendResponse(res: Response, photos: IPhoto[]) {
    res.json(photos);
  }
}
