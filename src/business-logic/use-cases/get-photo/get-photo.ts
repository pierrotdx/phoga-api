import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { IPhoto, Photo } from "../../models";

export class GetPhoto {
  constructor(
    private readonly photoMetadataDb: IPhotoMetadataDb,
    private readonly photoImageDb: IPhotoImageDb,
  ) {}

  async execute(id: IPhoto["_id"]): Promise<IPhoto> {
    const metadata = await this.photoMetadataDb.getById(id);
    const imageBuffer = await this.photoImageDb.getById(id);
    const photo = new Photo(id, { metadata, imageBuffer });
    return photo;
  }
}
