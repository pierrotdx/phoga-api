import { ExpressController, IExpressController } from "#shared/express";
import { AjvValidator, IValidator } from "#shared/validators";
import { type Request, type Response } from "express";

import {
  DeletePhotoParser,
  DeletePhotoSchema,
  DeletePhotoUseCase,
  IDeletePhotoParams,
  IDeletePhotoParser,
  IDeletePhotoUseCase,
  IPhoto,
  IPhotoDataDb,
  IPhotoImageDb,
} from "../..";

export class DeletePhotoController
  extends ExpressController<IDeletePhotoParams>
  implements IExpressController
{
  private readonly useCase: IDeletePhotoUseCase;
  private readonly validator: IValidator;
  private readonly parser: IDeletePhotoParser;

  constructor(
    private readonly photoDataDb: IPhotoDataDb,
    private readonly imageDb: IPhotoImageDb,
  ) {
    super();
    this.useCase = new DeletePhotoUseCase(this.photoDataDb, this.imageDb);
    this.validator = new AjvValidator(DeletePhotoSchema);
    this.parser = new DeletePhotoParser();
  }

  protected getParamsFromRequest(req: Request): IDeletePhotoParams {
    const reqData = { ...req.params, ...req.query };
    this.validator.validate(reqData);
    return this.parser.parse(req);
  }

  protected async executeUseCase(_id: IPhoto["_id"]): Promise<void> {
    return await this.useCase.execute(_id);
  }

  protected sendResponse(res: Response, photo: IPhoto) {
    res.json(photo);
  }
}
