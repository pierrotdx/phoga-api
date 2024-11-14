import { Request, Response } from "express";
import { Readable } from "node:stream";

import { GetPhotoField, IUseCases } from "@domain";
import { IParsers, IValidators } from "@http-server";

import { IPhotoController } from "../../models/controllers/photo-controller";

export class PhotoController implements IPhotoController {
  constructor(
    private readonly useCases: IUseCases,
    private readonly validators: IValidators,
    private readonly parsers: IParsers,
  ) {}

  getMetadata = async (req: Request, res: Response) => {
    const id = this.validateAndParseGetPhoto(req);
    const photo = await this.useCases.getPhoto.execute(id, {
      fields: [GetPhotoField.Metadata],
    });
    res.json(photo);
  };

  private validateAndParseGetPhoto(req: Request) {
    this.validators.getPhoto.validate(req.params);
    const id = this.parsers.getPhoto.parse(req.params);
    return id;
  }

  getImage = async (req: Request, res: Response) => {
    const id = this.validateAndParseGetPhoto(req);
    const photo = await this.useCases.getPhoto.execute(id, {
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
