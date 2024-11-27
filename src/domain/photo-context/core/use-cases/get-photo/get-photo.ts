import { IImageEditor, ImageEditor } from "@shared";

import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { GetPhotoField, IGetPhotoOptions, IPhoto, Photo } from "../../models";

export class GetPhoto {
  constructor(
    private readonly photoMetadataDb: IPhotoMetadataDb,
    private readonly photoImageDb: IPhotoImageDb,
    private readonly imageEditor: IImageEditor,
  ) {}

  async execute(
    id: IPhoto["_id"],
    options: IGetPhotoOptions = {
      fields: [GetPhotoField.ImageBuffer, GetPhotoField.Metadata],
    },
  ): Promise<IPhoto> {
    const data: {
      metadata?: IPhoto["metadata"];
      imageBuffer?: IPhoto["imageBuffer"];
    } = {};

    const includeMetadata = options?.fields?.includes(GetPhotoField.Metadata);
    if (includeMetadata) {
      data.metadata = await this.photoMetadataDb.getById(id);
    }

    const includeImageBuffer = options?.fields?.includes(
      GetPhotoField.ImageBuffer,
    );
    if (includeImageBuffer) {
      data.imageBuffer = await this.getImage(id, options);
    }
    return new Photo(id, data);
  }

  private async getImage(
    id: IPhoto["_id"],
    options: IGetPhotoOptions,
  ): Promise<Buffer> {
    const image = await this.photoImageDb.getById(id);
    return options.imageSize
      ? await this.imageEditor.resize(image, options.imageSize)
      : image;
  }
}
