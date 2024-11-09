import { Storage } from "@google-cloud/storage";

import { GcsBucket } from "./models";

export class GcStorageTestUtils {
  constructor(private readonly storage: Storage) {}

  async deleteAllImages(): Promise<void> {
    await this.deleteAllFiles(
      GcsBucket.PhotoImages,
      this.onDeleteAllImagesError,
    );
  }

  private async deleteAllFiles(
    bucketName: GcsBucket,
    errorCallbackFn?: (err: any) => Promise<void>,
  ) {
    try {
      const bucket = this.storage.bucket(bucketName);
      await bucket.deleteFiles();
    } catch (err) {
      await errorCallbackFn(err);
    }
  }

  private onDeleteAllImagesError = async (err: any) => {
    if (err.message.includes("Not Found")) {
      await this.storage.createBucket(GcsBucket.PhotoImages);
    } else {
      throw err;
    }
  };
}
