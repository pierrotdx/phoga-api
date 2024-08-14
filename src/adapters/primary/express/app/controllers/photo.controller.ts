import { Request, Response } from "express";

import {
  AddPhotoSchema,
  DeletePhotoSchema,
  GetPhotoSchema,
  IPhotoControllerParams,
  ReplacePhotoSchema,
} from "../../models";

export class PhotoController {
  constructor(private readonly params: IPhotoControllerParams) {}

  getPhotoHandler = async (req: Request, res: Response) => {
    const { useCase, validator } = this.params.getPhoto;
    const id = validator.parse(GetPhotoSchema, req);
    const photo = await useCase.execute(id);
    res.json(photo);
  };

  addPhotoHandler = async (req: Request, res: Response) => {
    const { useCase, validator } = this.params.addPhoto;
    const photo = validator.parse(AddPhotoSchema, req);
    await useCase.execute(photo);
    res.sendStatus(200);
  };

  replacePhotoHandler = async (req: Request, res: Response) => {
    const { useCase, validator } = this.params.replacePhoto;
    const photo = validator.parse(ReplacePhotoSchema, req);
    await useCase.execute(photo);
    res.sendStatus(200);
  };

  deletePhotoHandler = async (req: Request, res: Response) => {
    const { useCase, validator } = this.params.deletePhoto;
    const id = validator.parse(DeletePhotoSchema, req);
    await useCase.execute(id);
    res.sendStatus(200);
  };
}
