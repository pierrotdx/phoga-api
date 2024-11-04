import { Storage, StorageOptions } from "@google-cloud/storage";

import { gcsTestApiEndpoint } from "./constants.gcs";
import { GcsBucket } from "./models";

export class GcsManager {
  private storage: Storage;

  constructor(
    private readonly options: StorageOptions = {
      apiEndpoint: gcsTestApiEndpoint,
      projectId: "test",
    },
  ) {}

  async getStorage(): Promise<Storage> {
    if (!this.storage) {
      await this.setStorage();
    }
    return this.storage;
  }

  async setStorage() {
    const storage = new Storage(this.options);
    this.storage = storage;
  }

  async deleteAllFiles(
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

  async createBucket(bucketName: GcsBucket): Promise<void> {
    await this.storage.createBucket(bucketName);
  }
}
