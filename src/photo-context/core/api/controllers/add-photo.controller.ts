import { ExpressController, IExpressController } from "#shared/express";
import { AjvValidator, IValidator } from "#shared/validators";
import { type Request, type Response } from "express";

import { IPhotoDataDb, IPhotoImageDb } from "../../gateways";
import { IAddPhotoParser, IAddPhotoUseCase, IPhoto } from "../../models";
import { AddPhotoUseCase } from "../../use-cases";
import { AddPhotoParser } from "../parsers";
import { AddPhotoSchema } from "../schemas";

export class AddPhotoController
  extends ExpressController
  implements IExpressController
{
  private readonly useCase: IAddPhotoUseCase;
  private readonly validator: IValidator;
  private readonly parser: IAddPhotoParser;

  constructor(
    private readonly photoDataDb: IPhotoDataDb,
    private readonly imageDb: IPhotoImageDb,
  ) {
    super();
    this.useCase = new AddPhotoUseCase(this.photoDataDb, this.imageDb);
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
