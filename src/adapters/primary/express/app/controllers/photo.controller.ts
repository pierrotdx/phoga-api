import { Request, Response } from "express";

import { AddPhoto, GetPhoto } from "../../../../../business-logic";
import {
  AddPhotoSchema,
  GetPhotoSchema,
  IAddPhotoValidator,
  IGetPhotoValidator,
} from "../../models";

export class PhotoController {
  constructor(
    private readonly getPhoto: {
      useCase: GetPhoto;
      validator: IGetPhotoValidator;
    },
    private readonly addPhoto: {
      useCase: AddPhoto;
      validator: IAddPhotoValidator;
    },
  ) {}

  async getPhotoHandler(req: Request, res: Response) {
    const _id = this.getPhoto.validator.parse(GetPhotoSchema, req);
    await this.getPhoto.useCase.execute(_id);
    res.sendStatus(200);
  }

  async addPhotoHandler(req: Request, res: Response) {
    const photo = this.addPhoto.validator.parse(AddPhotoSchema, req);
    await this.addPhoto.useCase.execute(photo);
    res.sendStatus(200);
  }
}
