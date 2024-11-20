import { randomInt } from "node:crypto";

import { IAssertionsCounter } from "@assertions-counter";
import { IPhoto } from "@domain";
import { Storage } from "@google-cloud/storage";
import { DbsTestUtils, GcsBucket } from "@shared";

import { PhotoImageDbGcs } from "./photo-image-db.gcs";

export class PhotoImageDbGcsTestUtils {
  private readonly storage: Storage;
  private dbsTestUtils: DbsTestUtils;
  public photoImageDbGcs: PhotoImageDbGcs;

  constructor(apiEndpoint: string, projectId: string) {
    this.storage = new Storage({
      apiEndpoint: apiEndpoint,
      projectId: projectId,
    });
  }

  async internalSetup(): Promise<void> {
    this.photoImageDbGcs = new PhotoImageDbGcs(this.storage);
    this.testUtilsFactory();
    await this.deleteAllImages();
  }

  private testUtilsFactory(): void {
    this.dbsTestUtils = new DbsTestUtils(undefined, this.photoImageDbGcs);
  }

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

  getPhotoImageDbGcs(): PhotoImageDbGcs {
    return this.photoImageDbGcs;
  }

  async insertPhotoInDbs(photo: IPhoto): Promise<void> {
    await this.dbsTestUtils.insertPhotoInDbs(photo);
  }

  async insertPhotosInDbs(photos: IPhoto[]): Promise<void> {
    await this.dbsTestUtils.insertPhotosInDbs(photos);
  }

  async deletePhotoIfNecessary(id: IPhoto["_id"]): Promise<void> {
    await this.dbsTestUtils.deletePhotoIfNecessary(id);
  }

  async deletePhotosInDbs(ids: IPhoto["_id"][]): Promise<void> {
    await this.dbsTestUtils.deletePhotosInDbs(ids);
  }

  async getPhotoImageFromDb(id: IPhoto["_id"]): Promise<IPhoto["imageBuffer"]> {
    return this.dbsTestUtils.getPhotoImageFromDb(id);
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
    const dbImage = await this.dbsTestUtils.getPhotoImageFromDb(photo._id);
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
    const imageFromDb = await this.dbsTestUtils.getPhotoImageFromDb(
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
    const dbImageAfter = await this.dbsTestUtils.getPhotoImageFromDb(photo._id);
    expect(dbImageBefore).toBeDefined();
    expect(dbImageBefore).toEqual(photo.imageBuffer);
    expect(dbImageAfter).toBeUndefined();
    assertionsCounter.increase(3);
  }
}
