import { ErrorWithStatus, HttpErrorCode } from "#shared/models";
import { buffer } from "node:stream/consumers";

import { Bucket, Storage } from "@google-cloud/storage";

import { IPhoto, IPhotoImageDb } from "../../../../core";
import { GetByIds } from "./get-by-ids";

export class PhotoImageDbGcs implements IPhotoImageDb {
  private readonly bucket: Bucket;

  constructor(
    private readonly storage: Storage,
    private readonly bucketName: string,
  ) {
    this.bucket = this.storage.bucket(this.bucketName);
  }

  async insert(photo: IPhoto): Promise<void> {
    await this.save(photo);
  }

  async replace(photo: IPhoto): Promise<void> {
    await this.save(photo);
  }

  private async save(photo: IPhoto) {
    const file = this.bucket.file(photo._id);
    await file.save(photo.imageBuffer, { contentType: "image/jpeg" });
  }

  async checkExists(id: IPhoto["_id"]): Promise<boolean> {
    const file = this.bucket.file(id);
    const exists = (await file.exists())[0];
    return exists;
  }

  async getById(id: IPhoto["_id"]): Promise<Buffer> {
    try {
      const fileStream = this.bucket.file(id).createReadStream();
      return await buffer(fileStream);
    } catch (err) {
      return undefined;
    }
  }

  async delete(id: IPhoto["_id"]): Promise<void> {
    try {
      const file = this.bucket.file(id);
      await file.delete();
    } catch (err) {
      if (err.code === 404) {
        const error = new ErrorWithStatus(
          `failed to delete image of photo '${id}': not found`,
          HttpErrorCode.NotFound,
        );
        throw error;
      }
      throw err;
    }
  }

  async getByIds(ids: IPhoto["_id"][]): Promise<Record<IPhoto["_id"], Buffer>> {
    return new GetByIds(this.bucket).execute(ids);
  }
}
