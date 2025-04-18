import { ExpressController, IExpressController } from "#shared/express";
import { AjvValidator, IValidator } from "#shared/validators";
import { type Request, type Response } from "express";

import {
  GetPhotoField,
  GetPhotoParser,
  GetPhotoSchema,
  GetPhotoUseCase,
  IGetPhotoParser,
  IGetPhotoUseCase,
  IPhoto,
  IPhotoBaseDb,
  IPhotoImageDb,
} from "../..";

export class GetPhotoBaseController
  extends ExpressController
  implements IExpressController
{
  private readonly useCase: IGetPhotoUseCase;
  private readonly validator: IValidator;
  private readonly parser: IGetPhotoParser;

  constructor(
    private readonly photoBaseDb: IPhotoBaseDb,
    private readonly imageDb: IPhotoImageDb,
  ) {
    super();
    this.useCase = new GetPhotoUseCase(this.photoBaseDb, this.imageDb);
    this.validator = new AjvValidator(GetPhotoSchema);
    this.parser = new GetPhotoParser();
  }

  protected getParamsFromRequest(req: Request): IPhoto["_id"] {
    const reqData = { ...req.params, ...req.query };
    this.validator.validate(reqData);
    return this.parser.parse(reqData);
  }

  protected async executeUseCase(_id: IPhoto["_id"]): Promise<IPhoto> {
    return await this.useCase.execute(_id, {
      fields: [GetPhotoField.Base],
    });
  }

  protected sendResponse(res: Response, photo: IPhoto) {
    res.json(photo);
  }
}
