import { Request, Response } from "express";

import {
  AddPhoto,
  GetPhoto,
  ReplacePhoto,
} from "../../../../../business-logic";
import {
  AddPhotoSchema,
  GetPhotoSchema,
  IAddPhotoValidator,
  IGetPhotoValidator,
  IReplacePhotoValidator,
  ReplacePhotoSchema,
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
    private readonly replacePhoto: {
      useCase: ReplacePhoto;
      validator: IReplacePhotoValidator;
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

  async replacePhotoHandler(req: Request, res: Response) {
    const photo = this.replacePhoto.validator.parse(ReplacePhotoSchema, req);
    await this.replacePhoto.useCase.execute(photo);
    res.sendStatus(200);
  }
}
