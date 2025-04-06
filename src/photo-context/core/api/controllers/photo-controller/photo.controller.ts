import { Request, Response } from "express";
import { Readable } from "node:stream";

import {
  GetPhotoField,
  IParsers,
  IPhotoController,
  IUseCases,
  IValidators,
} from "../../../models";

export class PhotoController implements IPhotoController {
  constructor(
    private readonly useCases: IUseCases,
    private readonly validators: IValidators,
    private readonly parsers: IParsers,
  ) {}

  getMetadata = async (req: Request, res: Response) => {
    const { _id } = this.validateAndParseGetPhoto(req);
    const photo = await this.useCases.getPhoto.execute(_id, {
      fields: [GetPhotoField.Metadata],
    });
    res.json(photo);
  };

  private validateAndParseGetPhoto(req: Request) {
    const reqData = { ...req.params, ...req.query };
    this.validators.getPhoto.validate(reqData);
    return this.parsers.getPhoto.parse(reqData);
  }

  getImage = async (req: Request, res: Response) => {
    const { _id } = this.validateAndParseGetPhoto(req);
    const photo = await this.useCases.getPhoto.execute(_id, {
      fields: [GetPhotoField.ImageBuffer],
    });
    const imageStream = Readable.from(photo.imageBuffer);
    res.setHeader("Content-Type", "image/jpeg");
    imageStream.pipe(res);
    imageStream.on("end", () => {
      res.end();
    });
  };

  search = async (req: Request, res: Response) => {
    this.validators.searchPhoto.validate(req.query);
    const searchOptions = this.parsers.searchPhoto.parse(req.query);
    const result = await this.useCases.searchPhoto.execute(searchOptions);
    res.json(result);
  };
}
