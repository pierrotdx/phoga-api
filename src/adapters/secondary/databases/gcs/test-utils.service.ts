import { Storage } from "@google-cloud/storage";

import { gcsTestApiEndpoint } from "./constants.gcs";
import { GcsBucket } from "./models";

class GcsTestUtils {
  private storage: Storage;

  async getStorage(): Promise<Storage> {
    if (!this.storage) {
      await this.setStorage();
    }
    return this.storage;
  }

  private async setStorage() {
    const storage = new Storage({
      apiEndpoint: gcsTestApiEndpoint,
      projectId: "test",
    });
    await this.setupPhotoImageBucket(storage);
    this.storage = storage;
  }

  private async setupPhotoImageBucket(storage: Storage) {
    try {
      const bucket = storage.bucket(GcsBucket.PhotoImages);
      await bucket.deleteFiles();
    } catch (err) {
      await this.onSetupPhotoImageBucketError(err, storage);
    }
  }

  private async onSetupPhotoImageBucketError(err: any, storage: Storage) {
    if (err.message.includes("Not Found")) {
      await storage.createBucket(GcsBucket.PhotoImages);
    } else {
      throw err;
    }
  }
}

export const gcsTestUtils = new GcsTestUtils();
