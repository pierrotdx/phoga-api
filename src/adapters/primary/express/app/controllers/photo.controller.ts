import { Request, Response } from "express";

import {
  AddPhoto,
  DeletePhoto,
  GetPhoto,
  ReplacePhoto,
} from "../../../../../business-logic";
import {
  AddPhotoSchema,
  DeletePhotoSchema,
  GetPhotoSchema,
  IAddPhotoValidator,
  IDeletePhotoValidator,
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
    private readonly deletePhoto: {
      useCase: DeletePhoto;
      validator: IDeletePhotoValidator;
    },
  ) {}

  async getPhotoHandler(req: Request, res: Response) {
    const id = this.getPhoto.validator.parse(GetPhotoSchema, req);
    await this.getPhoto.useCase.execute(id);
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

  async deletePhotoHandler(req: Request, res: Response) {
    const id = this.deletePhoto.validator.parse(DeletePhotoSchema, req);
    await this.deletePhoto.useCase.execute(id);
    res.sendStatus(200);
  }
}
