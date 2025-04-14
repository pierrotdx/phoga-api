import { IPhotoDataDb, IPhotoImageDb } from "../../gateways";
import {
  GetPhotoField,
  IGetPhotoOptions,
  IGetPhotoUseCase,
  IPhoto,
  Photo,
} from "../../models";

export class GetPhotoUseCase implements IGetPhotoUseCase {
  constructor(
    private readonly photoDataDb: IPhotoDataDb,
    private readonly photoImageDb: IPhotoImageDb,
  ) {}

  async execute(
    id: IPhoto["_id"],
    options: IGetPhotoOptions = {
      fields: [GetPhotoField.ImageBuffer, GetPhotoField.Base],
    },
  ): Promise<IPhoto> {
    const data: {
      metadata?: IPhoto["metadata"];
      imageBuffer?: IPhoto["imageBuffer"];
    } = {};

    const includeBase = options?.fields?.includes(GetPhotoField.Base);
    if (includeBase) {
      data.metadata = (await this.photoDataDb.getById(id))?.metadata;
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
