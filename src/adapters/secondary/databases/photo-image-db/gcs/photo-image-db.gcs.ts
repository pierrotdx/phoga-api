import { IPhoto, IPhotoImageDb } from "@business-logic";
import { Bucket, Storage } from "@google-cloud/storage";

import { GcsBucket } from "../../gcs/models/gcs-buckets";

export class PhotoImageDbGcs implements IPhotoImageDb {
  private readonly bucket: Bucket;

  constructor(private readonly storage: Storage) {
    this.bucket = this.storage.bucket(GcsBucket.PhotoImages);
  }

  async insert(photo: IPhoto): Promise<void> {
    await this.save(photo);
  }

  async replace(photo: IPhoto): Promise<void> {
    await this.save(photo);
  }

  private async save(photo: IPhoto) {
    const file = this.bucket.file(photo._id);
    await file.save(photo.imageBuffer);
  }

  async checkExists(id: IPhoto["_id"]): Promise<boolean> {
    const file = this.bucket.file(id);
    const exists = (await file.exists())[0];
    return exists;
  }

  async getById(id: IPhoto["_id"]): Promise<Buffer> {
    try {
      const file = this.bucket.file(id);
      const buffer = (await file.download())[0];
      return buffer;
    } catch (err) {
      return undefined;
    }
  }

  async delete(id: IPhoto["_id"]): Promise<void> {
    const file = this.bucket.file(id);
    await file.delete();
  }

  async getByIds(ids: IPhoto["_id"][]): Promise<Record<IPhoto["_id"], Buffer>> {
    return {};
  }
}
