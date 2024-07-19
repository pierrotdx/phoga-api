import { IPhotoImageRepository, IPhotoMetadataRepository } from "../gateways";
import { IPhoto, Photo } from "../models";

export class AddPhoto {
  constructor(
    private readonly photoMetadataRepository: IPhotoMetadataRepository,
    private readonly photoImageRepository: IPhotoImageRepository,
  ) {}

  async execute(photo: IPhoto): Promise<void> {
    await this.uploadImage(photo);
    await this.photoMetadataRepository.save(photo);
  }

  private async uploadImage(photo: Photo) {
    if (!photo.imageBuffer) {
      throw new Error(`no image to upload for photo: ${photo._id}`);
    }
    await this.photoImageRepository.save(photo);
  }
}
