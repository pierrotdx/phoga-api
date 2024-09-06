import { Request, Response } from "express";
import { Readable } from "node:stream";

import { GetPhotoField, IUseCases } from "@business-logic";
import { GetPhotoSchema, IValidators } from "@http-server";

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
}
