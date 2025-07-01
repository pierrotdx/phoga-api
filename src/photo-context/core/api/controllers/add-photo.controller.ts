import { ExpressController, IExpressController } from "#shared/express";
import { AjvValidator, IValidator } from "#shared/validators";
import { ITagDb } from "#tag-context";
import { type Request, type Response } from "express";

import { IPhotoDataDb, IPhotoImageDb } from "../../gateways";
import {
  IAddPhotoParams,
  IAddPhotoParser,
  IAddPhotoUseCase,
} from "../../models";
import { AddPhotoUseCase } from "../../use-cases";
import { AddPhotoParser } from "../parsers";
import { AddPhotoSchema } from "../schemas";

export class AddPhotoController
  extends ExpressController<IAddPhotoParams>
  implements IExpressController
{
  private readonly useCase: IAddPhotoUseCase;
  private readonly validator: IValidator;
  private readonly parser: IAddPhotoParser;

  constructor(
    private readonly photoDataDb: IPhotoDataDb,
    private readonly imageDb: IPhotoImageDb,
    private readonly tagDb: ITagDb,
  ) {
    super();
    this.useCase = new AddPhotoUseCase(
      this.photoDataDb,
      this.imageDb,
      this.tagDb,
    );
    this.validator = new AjvValidator(AddPhotoSchema);
    this.parser = new AddPhotoParser();
  }

  protected async getParamsFromRequest(req: Request): Promise<IAddPhotoParams> {
    // ATM for multipart/formData, we parse before validation...
    const parsedData = await this.parser.parse(req);
    this.validator.validate(parsedData);
    return parsedData;
  }

  protected async executeUseCase(
    addPhotoParams: IAddPhotoParams,
  ): Promise<void> {
    await this.useCase.execute(addPhotoParams);
  }

  protected sendResponse(res: Response): void {
    res.status(200).json();
  }
}
