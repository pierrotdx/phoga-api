import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { GetPhotoField, GetPhotoOptions, IPhoto, Photo } from "../../models";

export class GetPhoto {
  constructor(
    private readonly photoMetadataDb: IPhotoMetadataDb,
    private readonly photoImageDb: IPhotoImageDb,
  ) {}

  async execute(
    id: IPhoto["_id"],
    options: GetPhotoOptions = {
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
      data.imageBuffer = await this.photoImageDb.getById(id);
    }

    return new Photo(id, data);
  }
}
