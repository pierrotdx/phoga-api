import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { GetPhotoField, IGetPhotoOptions, IGetPhotoUseCase, IPhoto, Photo } from "../../models";

export class GetPhotoUseCase implements IGetPhotoUseCase {
  constructor(
    private readonly photoMetadataDb: IPhotoMetadataDb,
    private readonly photoImageDb: IPhotoImageDb,
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
      data.imageBuffer = await this.getImage(id);
    }
    return new Photo(id, data);
  }

  private async getImage(id: IPhoto["_id"]): Promise<Buffer> {
    return await this.photoImageDb.getById(id);
  }
}
