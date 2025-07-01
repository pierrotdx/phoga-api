import { ExpressController, IExpressController } from "#shared/express";
import { AjvValidator, IValidator } from "#shared/validators";
import { type Request, type Response } from "express";

import {
  GetPhotoParser,
  GetPhotoSchema,
  GetPhotoUseCase,
  IGetPhotoParams,
  IGetPhotoParser,
  IGetPhotoUseCase,
  IPhoto,
  IPhotoDataDb,
} from "../..";

export class GetPhotoDataController
  extends ExpressController<IGetPhotoParams>
  implements IExpressController
{
  private readonly useCase: IGetPhotoUseCase;
  private readonly validator: IValidator;
  private readonly parser: IGetPhotoParser;

  constructor(private readonly photoDataDb: IPhotoDataDb) {
    super();
    this.useCase = new GetPhotoUseCase(this.photoDataDb);
    this.validator = new AjvValidator(GetPhotoSchema);
    this.parser = new GetPhotoParser();
  }

  protected getParamsFromRequest(req: Request): IGetPhotoParams {
    const reqData = { ...req.params, ...req.query };
    this.validator.validate(reqData);
    return this.parser.parse(req);
  }

  protected async executeUseCase(_id: IPhoto["_id"]): Promise<IPhoto> {
    return await this.useCase.execute(_id);
  }

  protected sendResponse(res: Response, photo: IPhoto) {
    res.json(photo);
  }
}
