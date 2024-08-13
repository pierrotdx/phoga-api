import { Request, Response } from "express";

import { GetPhoto } from "../../../../../business-logic";
import { GetPhotoSchema, IGetPhotoValidator } from "../../models";

export class PhotoController {
  constructor(
    private readonly getPhoto: {
      useCase: GetPhoto;
      validator: IGetPhotoValidator;
    },
  ) {}

  async getPhotoHandler(req: Request, res: Response) {
    const { id } = this.getPhoto.validator.parse(GetPhotoSchema, req);
    await this.getPhoto.useCase.execute(id);
    res.sendStatus(200);
  }
}
