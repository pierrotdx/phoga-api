import { ExpressController, IExpressController } from "#shared/express";
import { AjvValidator, IValidator } from "#shared/validators";
import { type Request, type Response } from "express";
import { Readable } from "node:stream";

import {
  GetPhotoField,
  GetPhotoParser,
  GetPhotoSchema,
  GetPhotoUseCase,
  IGetPhotoParser,
  IGetPhotoUseCase,
  IPhoto,
  IPhotoDataDb,
  IPhotoImageDb,
} from "../..";

export class GetPhotoImageController
  extends ExpressController
  implements IExpressController
{
  private readonly useCase: IGetPhotoUseCase;
  private readonly validator: IValidator;
  private readonly parser: IGetPhotoParser;

  constructor(
    private readonly photoDataDb: IPhotoDataDb,
    private readonly imageDb: IPhotoImageDb,
  ) {
    super();
    this.useCase = new GetPhotoUseCase(this.photoDataDb, this.imageDb);
    this.validator = new AjvValidator(GetPhotoSchema);
    this.parser = new GetPhotoParser();
  }

  protected getParamsFromRequest(req: Request): IPhoto["_id"] {
    const reqData = { ...req.params, ...req.query };
    this.validator.validate(reqData);
    return this.parser.parse(req);
  }

  protected async executeUseCase(_id: IPhoto["_id"]): Promise<IPhoto> {
    return await this.useCase.execute(_id, {
      fields: [GetPhotoField.ImageBuffer],
    });
  }

  protected sendResponse(res: Response, photo: IPhoto): void {
    const imageStream = Readable.from(photo.imageBuffer);
    res.setHeader("Content-Type", "image/jpeg");
    imageStream.pipe(res);
    imageStream.on("end", () => {
      res.end();
    });
  }
}
