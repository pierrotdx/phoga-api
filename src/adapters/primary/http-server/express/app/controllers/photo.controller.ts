import { Request, Response } from "express";

import {
  AddPhotoSchema,
  DeletePhotoSchema,
  GetPhotoSchema,
  ReplacePhotoSchema,
} from "../../../models";
import { GetPhotoField } from "../../../../../../business-logic";
import { Readable } from "node:stream";
import { IPhotoControllerParams } from "../../models";

export class PhotoController {
  constructor(private readonly params: IPhotoControllerParams) {}

  getPhotoMetadataHandler = async (req: Request, res: Response) => {
    const { useCase, validator } = this.params.getPhoto;
    const id = validator.parse(GetPhotoSchema, req.params);
    const photo = await useCase.execute(id, {
      fields: [GetPhotoField.Metadata],
    });
    res.json(photo);
  };

  getPhotoImageHandler = async (req: Request, res: Response) => {
    const { useCase, validator } = this.params.getPhoto;
    const id = validator.parse(GetPhotoSchema, req.params);
    const photo = await useCase.execute(id, {
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
    const { useCase, validator } = this.params.addPhoto;
    const photo = validator.parse(AddPhotoSchema, req.body);
    await useCase.execute(photo);
    res.sendStatus(200);
  };

  replacePhotoHandler = async (req: Request, res: Response) => {
    const { useCase, validator } = this.params.replacePhoto;
    const photo = validator.parse(ReplacePhotoSchema, req.body);
    await useCase.execute(photo);
    res.sendStatus(200);
  };

  deletePhotoHandler = async (req: Request, res: Response) => {
    const { useCase, validator } = this.params.deletePhoto;
    const id = validator.parse(DeletePhotoSchema, req.params);
    await useCase.execute(id);
    res.sendStatus(200);
  };
}
