import { Request, Response } from "express";

import { IParsers, IUseCases, IValidators } from "../../../models";

export class AdminPhotoController {
  constructor(
    private readonly useCases: IUseCases,
    private readonly validators: IValidators,
    private readonly parsers: IParsers,
  ) {}

  addPhotoHandler = async (req: Request, res: Response) => {
    const photo = await this.parsers.addPhoto.parse(req);
    this.validators.addPhoto.validate(photo);
    await this.useCases.addPhoto.execute(photo);
    res.sendStatus(200);
  };

  replacePhotoHandler = async (req: Request, res: Response) => {
    const photo = await this.parsers.replacePhoto.parse(req);
    this.validators.replacePhoto.validate(photo);
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
