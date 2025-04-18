import { randomInt } from "node:crypto";

import { Storage } from "@google-cloud/storage";

import { IPhoto } from "../../../../core";
import { PhotoImageDbGcs } from "./photo-image-db.gcs";

export class PhotoImageDbGcsTestUtils {
  private readonly storage: Storage;
  public photoImageDbGcs: PhotoImageDbGcs;

  constructor(
    apiEndpoint: string,
    projectId: string,
    private readonly photoImageBucket: string,
  ) {
    this.storage = new Storage({
      apiEndpoint: apiEndpoint,
      projectId: projectId,
    });
  }

  async globalSetup(): Promise<void> {
    await this.createBucketIfNecessary();

    this.photoImageDbGcs = new PhotoImageDbGcs(
      this.storage,
      this.photoImageBucket,
    );
  }

  private async createBucketIfNecessary(): Promise<void> {
    try {
      await this.storage.createBucket(this.photoImageBucket);
    } catch (err) {
      if (err.message.includes("already exists")) {
        return;
      }
      throw err;
    }
  }

  getPhotoImageDbGcs(): PhotoImageDbGcs {
    return this.photoImageDbGcs;
  }

  pickRandomPhotoIds(photos: IPhoto[]): IPhoto["_id"][] {
    const randomPhotoIndices = this.generateRandomIndices(photos.length);
    const pickedPhotoIds = randomPhotoIndices.reduce<IPhoto["_id"][]>(
      (acc, index) => {
        const photo = photos[index];
        if (photo) {
          acc.push(photo._id);
        }
        return acc;
      },
      [],
    );
    return pickedPhotoIds;
  }

  private generateRandomIndices(nbPhotos: number): number[] {
    const nbIndices = randomInt(2, nbPhotos + 1);
    const indices: number[] = [];
    while (indices.length < nbIndices - 1) {
      const index = randomInt(0, nbPhotos - 1);
      if (!indices.includes(index)) {
        indices.push(index);
      }
    }
    return indices;
  }
}
