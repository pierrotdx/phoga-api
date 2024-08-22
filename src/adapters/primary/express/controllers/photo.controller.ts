import { Request, Response } from "express";

import {
  AddPhotoSchema,
  DeletePhotoSchema,
  GetPhotoSchema,
  IValidators,
  ReplacePhotoSchema,
} from "../../../../http-server";
import { GetPhotoField, IUseCases } from "../../../../business-logic";
import { Readable } from "node:stream";

export class PhotoController {
  constructor(
    private readonly useCases: IUseCases,
    private readonly validators: IValidators,
  ) {}

  getPhotoMetadataHandler = async (req: Request, res: Response) => {
    const id = this.validators.getPhoto.validateAndParse(
      GetPhotoSchema,
      req.params,
    );
    const photo = await this.useCases.getPhoto.execute(id, {
      fields: [GetPhotoField.Metadata],
    });
    res.json(photo);
  };

  getPhotoImageHandler = async (req: Request, res: Response) => {
    const id = this.validators.getPhoto.validateAndParse(
      GetPhotoSchema,
      req.params,
    );
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

  addPhotoHandler = async (req: Request, res: Response) => {
    const photo = this.validators.addPhoto.validateAndParse(
      AddPhotoSchema,
      req.body,
    );
    await this.useCases.addPhoto.execute(photo);
    res.sendStatus(200);
  };

  replacePhotoHandler = async (req: Request, res: Response) => {
    const photo = this.validators.replacePhoto.validateAndParse(
      ReplacePhotoSchema,
      req.body,
    );
    await this.useCases.replacePhoto.execute(photo);
    res.sendStatus(200);
  };

  deletePhotoHandler = async (req: Request, res: Response) => {
    const id = this.validators.deletePhoto.validateAndParse(
      DeletePhotoSchema,
      req.params,
    );
    await this.useCases.deletePhoto.execute(id);
    res.sendStatus(200);
  };
}
