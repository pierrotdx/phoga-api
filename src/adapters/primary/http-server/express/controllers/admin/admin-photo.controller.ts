import { Request, Response } from "express";

import { IUseCases } from "@business-logic";
import { IParsers, IValidators } from "@http-server";

export class AdminPhotoController {
  constructor(
    private readonly useCases: IUseCases,
    private readonly validators: IValidators,
    private readonly parsers: IParsers,
  ) {}

  addPhotoHandler = async (req: Request, res: Response) => {
    this.validators.addPhoto.validate(req.body);
    const photo = this.parsers.addPhoto.parse(req.body);
    await this.useCases.addPhoto.execute(photo);
    res.sendStatus(200);
  };

  replacePhotoHandler = async (req: Request, res: Response) => {
    this.validators.replacePhoto.validate(req.body);
    const photo = this.parsers.replacePhoto.parse({
      ...req.params,
      ...req.body,
    });
    await this.useCases.replacePhoto.execute(photo);
    res.sendStatus(200);
  };

  deletePhotoHandler = async (req: Request, res: Response) => {
    this.validators.deletePhoto.validate(req.params);
    const id = this.parsers.deletePhoto.parse(req.params);
    await this.useCases.deletePhoto.execute(id);
    res.sendStatus(200);
  };
}
