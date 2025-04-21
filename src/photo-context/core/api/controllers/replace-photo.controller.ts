import { ExpressController, IExpressController } from "#shared/express";
import { AjvValidator, IValidator } from "#shared/validators";
import { ITagDb } from "#tag-context";
import { type Request, type Response } from "express";

import { IPhotoDataDb, IPhotoImageDb } from "../../gateways";
import {
  IPhoto,
  IReplacePhotoParser,
  IReplacePhotoUseCase,
} from "../../models";
import { ReplacePhotoUseCase } from "../../use-cases";
import { ReplacePhotoParser } from "../parsers";
import { AddPhotoSchema } from "../schemas";

export class ReplacePhotoController
  extends ExpressController
  implements IExpressController
{
  private readonly useCase: IReplacePhotoUseCase;
  private readonly validator: IValidator;
  private readonly parser: IReplacePhotoParser;

  constructor(
    private readonly photoDataDb: IPhotoDataDb,
    private readonly imageDb: IPhotoImageDb,
    private readonly tagDb: ITagDb,
  ) {
    super();
    this.useCase = new ReplacePhotoUseCase(
      this.photoDataDb,
      this.imageDb,
      this.tagDb,
    );
    this.validator = new AjvValidator(AddPhotoSchema);
    this.parser = new ReplacePhotoParser();
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
