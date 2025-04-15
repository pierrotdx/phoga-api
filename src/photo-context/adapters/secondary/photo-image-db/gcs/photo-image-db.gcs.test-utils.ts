import { IAssertionsCounter } from "#shared/assertions-counter";
import { randomInt } from "node:crypto";

import { Storage } from "@google-cloud/storage";

import { IPhoto, PhotoTestUtils } from "../../../../core";
import { PhotoImageDbGcs } from "./photo-image-db.gcs";

export class PhotoImageDbGcsTestUtils {
  private readonly storage: Storage;
  public photoImageDbGcs: PhotoImageDbGcs;

  private photoTestUtils: PhotoTestUtils;

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

  async internalSetup(): Promise<void> {
    this.photoImageDbGcs = new PhotoImageDbGcs(
      this.storage,
      this.photoImageBucket,
    );
    this.photoTestUtils = new PhotoTestUtils(undefined, this.photoImageDbGcs);
    await this.deleteAllImages();
  }

  async deleteAllImages(): Promise<void> {
    await this.deleteAllFiles(
      this.photoImageBucket,
      this.onDeleteAllImagesError,
    );
  }

  private async deleteAllFiles(
    bucketName: string,
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
      await this.storage.createBucket(this.photoImageBucket);
    } else {
      throw err;
    }
  };

  getPhotoImageDbGcs(): PhotoImageDbGcs {
    return this.photoImageDbGcs;
  }

  async insertPhotoInDbs(photo: IPhoto): Promise<void> {
    await this.photoTestUtils.insertPhotoInDbs(photo);
  }

  async insertPhotosInDbs(photos: IPhoto[]): Promise<void> {
    await this.photoTestUtils.insertPhotosInDbs(photos);
  }

  async deletePhotoIfNecessary(id: IPhoto["_id"]): Promise<void> {
    await this.photoTestUtils.deletePhotoFromDb(id);
  }

  async deletePhotosInDbs(ids: IPhoto["_id"][]): Promise<void> {
    await this.photoTestUtils.deletePhotosFromDb(ids);
  }

  async getPhotoImageFromDb(id: IPhoto["_id"]): Promise<IPhoto["imageBuffer"]> {
    return this.photoTestUtils.getPhotoImageFromDb(id);
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

  async expectImageToBeUploaded(photo: IPhoto): Promise<void> {
    const dbImage = await this.photoTestUtils.getPhotoImageFromDb(photo._id);
    expect(dbImage).toBeDefined();
    expect(dbImage).toEqual(photo.imageBuffer);
    expect.assertions(2);
  }

  async expectCheckExistValue({
    receivedValue: photoId,
    expectedValue,
    assertionsCounter,
  }: {
    receivedValue: boolean;
    expectedValue: boolean;
    assertionsCounter: IAssertionsCounter;
  }): Promise<void> {
    expect(photoId).toBe(expectedValue);
    assertionsCounter.increase(1);
  }

  expectResultToMatchPhotos(
    result: Record<IPhoto["_id"], Buffer>,
    expectedPhotos: IPhoto[],
    assertionsCounter: IAssertionsCounter,
  ): void {
    const idBufferPairs = Object.entries(result);
    expect(idBufferPairs.length).toBe(expectedPhotos.length);
    assertionsCounter.increase();
    idBufferPairs.forEach(([id, buffer]) => {
      expect(buffer).toBeDefined();
      const storedPhoto = expectedPhotos.find((p) => p._id === id);
      expect(buffer).toEqual(storedPhoto.imageBuffer);
      assertionsCounter.increase(2);
    });
  }

  async expectDbImageToBeReplaced({
    initPhoto,
    replacingPhoto,
    dbImageBefore,
    assertionsCounter,
  }: {
    initPhoto: IPhoto;
    replacingPhoto: IPhoto;
    dbImageBefore: Buffer;
    assertionsCounter: IAssertionsCounter;
  }) {
    expect(initPhoto._id).toBe(replacingPhoto._id);
    expect(dbImageBefore).toEqual(initPhoto.imageBuffer);
    const imageFromDb = await this.photoTestUtils.getPhotoImageFromDb(
      replacingPhoto._id,
    );
    expect(imageFromDb).not.toEqual(initPhoto.imageBuffer);
    expect(imageFromDb).toEqual(replacingPhoto.imageBuffer);
    assertionsCounter.increase(4);
  }

  async expectDbImageToBeDeleted({
    photo,
    dbImageBefore,
    assertionsCounter,
  }: {
    photo: IPhoto;
    dbImageBefore: Buffer;
    assertionsCounter: IAssertionsCounter;
  }) {
    const dbImageAfter = await this.photoTestUtils.getPhotoImageFromDb(
      photo._id,
    );
    expect(dbImageBefore).toBeDefined();
    expect(dbImageBefore).toEqual(photo.imageBuffer);
    expect(dbImageAfter).toBeUndefined();
    assertionsCounter.increase(3);
  }
}
