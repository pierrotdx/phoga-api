import { GcsManager } from "./gcs-manager";
import { GcsBucket } from "./models";

export class GcsTestUtils {
  constructor(private readonly gcsManager: GcsManager) {}

  async deleteAllImages(): Promise<void> {
    await this.gcsManager.deleteAllFiles(
      GcsBucket.PhotoImages,
      this.onDeleteAllImagesError,
    );
  }

  private onDeleteAllImagesError = async (err: any) => {
    if (err.message.includes("Not Found")) {
      await this.gcsManager.createBucket(GcsBucket.PhotoImages);
    } else {
      throw err;
    }
  };
}
