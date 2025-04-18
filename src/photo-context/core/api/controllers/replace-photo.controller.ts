import { ExpressController, IExpressController } from "#shared/express";
import { AjvValidator, IValidator } from "#shared/validators";
import { type Request, type Response } from "express";

import { IPhotoImageDb, IPhotoBaseDb } from "../../gateways";
import {
  IPhoto,
  IReplacePhotoParser,
  IReplacePhotoUseCase,
} from "../../models";
import { ReplacePhotoUseCase } from "../../use-cases";
import { AddPhotoParser } from "../parsers";
import { AddPhotoSchema } from "../schemas";

export class ReplacePhotoController
  extends ExpressController
  implements IExpressController
{
  private readonly useCase: IReplacePhotoUseCase;
  private readonly validator: IValidator;
  private readonly parser: IReplacePhotoParser;

  constructor(
    private readonly photoBaseDb: IPhotoBaseDb,
    private readonly imageDb: IPhotoImageDb,
  ) {
    super();
    this.useCase = new ReplacePhotoUseCase(this.photoBaseDb, this.imageDb);
    this.validator = new AjvValidator(AddPhotoSchema);
    this.parser = new AddPhotoParser();
  }

  protected async getParamsFromRequest(req: Request): Promise<IPhoto> {
    const photo = await this.parser.parse(req);
    this.validator.validate(photo);
    return photo;
  }

  protected async executeUseCase(photo: IPhoto): Promise<void> {
    await this.useCase.execute(photo);
  }

  protected sendResponse(res: Response): void {
    res.status(200).json();
  }
}
