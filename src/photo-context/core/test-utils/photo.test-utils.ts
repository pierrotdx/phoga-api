import { IAssertionsCounter } from "@shared/assertions-counter";

import { IPhotoImageDb, IPhotoMetadataDb } from "../gateways";
import { IPhoto, IPhotoMetadata, Photo } from "../models";
import { PhotoImageTestUtils } from "./photo-image.test-utils";
import { PhotoMetadataTestUtils } from "./photo-metadata.test-utils";

export class PhotoTestUtils {
  private readonly photoMetadataTestUtils: PhotoMetadataTestUtils;
  private readonly photoImageTestUtils: PhotoImageTestUtils;

  constructor(
    photoMetadataDb?: IPhotoMetadataDb,
    photoImageDb?: IPhotoImageDb,
  ) {
    if (photoMetadataDb) {
      this.photoMetadataTestUtils = new PhotoMetadataTestUtils(photoMetadataDb);
    }
    if (photoImageDb) {
      this.photoImageTestUtils = new PhotoImageTestUtils(photoImageDb);
    }
  }

  async insertPhotosInDbs(photos: IPhoto[]): Promise<void> {
    const insertPromises = photos.map(this.insertPhotoInDbs.bind(this));
    await Promise.all(insertPromises);
  }

  async insertPhotoInDbs(photo: IPhoto): Promise<void> {
    await this.photoMetadataTestUtils?.insertPhotoMetadataDoc(photo);
    await this.photoImageTestUtils?.insertPhotoImageInDbs(photo);
  }

  async getPhotoMetadataDoc(id: IPhoto["_id"]): Promise<IPhotoMetadata> {
    return await this.photoMetadataTestUtils.getPhotoMetadataDoc(id);
  }

  async getPhotoImageFromDb(id: IPhoto["_id"]): Promise<IPhoto["imageBuffer"]> {
    return await this.photoImageTestUtils.getPhotoImageFromDb(id);
  }

  async deletePhotoMetadata(id: IPhoto["_id"]): Promise<void> {
    return this.photoMetadataTestUtils.deletePhotoMetadataDoc(id);
  }

  async deletePhotosInDbs(photoIds: IPhoto["_id"][]): Promise<void> {
    const deletePromises = photoIds.map((id) =>
      this.deletePhotoIfNecessary(id),
    );
    await Promise.all(deletePromises);
  }

  async deletePhotoIfNecessary(id: IPhoto["_id"]): Promise<void> {
    try {
      await this.photoMetadataTestUtils?.deletePhotoMetadataDoc(id);
      await this.photoImageTestUtils?.deletePhotoImageFromDb(id);
    } catch (err) {}
  }

  async getPhotoFromDb(id: IPhoto["_id"]): Promise<IPhoto> {
    const imageBuffer = await this.photoImageTestUtils?.getPhotoImageFromDb(id);
    const metadata = await this.photoMetadataTestUtils?.getPhotoMetadataDoc(id);
    return new Photo(id, { imageBuffer, metadata });
  }

  expectMatchingPhotos(
    photo1: IPhoto,
    photo2: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): void {
    expect(photo1._id).toEqual(photo2._id);
    assertionsCounter.increase();
    this.photoMetadataTestUtils.expectMatchingPhotosMetadata(
      photo1.metadata,
      photo2.metadata,
      assertionsCounter,
    );
    this.expectMatchingBuffers(
      photo1.imageBuffer,
      photo2.imageBuffer,
      assertionsCounter,
    );
  }

  private expectMatchingBuffers(
    bufferA: Buffer,
    bufferB: Buffer,
    assertionsCounter: IAssertionsCounter,
  ) {
    const areEqualBuffers = bufferA.equals(bufferB);
    expect(areEqualBuffers).toBe(true);
    assertionsCounter.increase();
  }

  async expectPhotoImageToBeInDb(
    photo: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    const dbImage = await this.photoImageTestUtils.getPhotoImageFromDb(
      photo._id,
    );
    this.expectMatchingBuffers(photo.imageBuffer, dbImage, assertionsCounter);
  }

  expectMatchingPhotoImages(
    expectedPhoto: IPhoto,
    result: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): void {
    if (!expectedPhoto.imageBuffer) {
      return;
    }
    this.expectMatchingBuffers(
      expectedPhoto.imageBuffer,
      result.imageBuffer,
      assertionsCounter,
    );
  }

  async expectPhotoMetadataToBeInDb(
    photo: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ) {
    await this.photoMetadataTestUtils.expectPhotoMetadataToBeInDb(
      photo,
      assertionsCounter,
    );
  }

  async expectPhotoToBeUploaded(
    photo: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    await this.expectPhotoMetadataToBeInDb(photo, assertionsCounter);
    await this.expectPhotoImageToBeInDb(photo, assertionsCounter);
  }
}
