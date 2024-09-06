import { Request, Response } from "express";

import { IUseCases } from "@business-logic";
import {
  AddPhotoSchema,
  DeletePhotoSchema,
  IValidators,
  ReplacePhotoSchema,
} from "@http-server";

export class AdminPhotoController {
  constructor(
    private readonly useCases: IUseCases,
    private readonly validators: IValidators,
  ) {}

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
