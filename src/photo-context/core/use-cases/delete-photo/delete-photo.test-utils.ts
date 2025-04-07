import {
  AssertionsCounter,
  IAssertionsCounter,
} from "#shared/assertions-counter";

import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { IDeletePhotoUseCase, IPhoto } from "../../models";
import { PhotoTestUtils } from "../../test-utils";
import { DeletePhotoUseCase } from "./delete-photo";

export class DeletePhotoTestUtils {
  private readonly testedUseCase: IDeletePhotoUseCase;

  private readonly photoTestUtils: PhotoTestUtils;
  private readonly assertionsCounter: IAssertionsCounter;

  constructor(
    photoMetadataDb: IPhotoMetadataDb,
    public readonly photoImageDb: IPhotoImageDb,
  ) {
    this.testedUseCase = new DeletePhotoUseCase(photoMetadataDb, photoImageDb);
    this.photoTestUtils = new PhotoTestUtils(photoMetadataDb, photoImageDb);
    this.assertionsCounter = new AssertionsCounter();
  }

  async executeTestedUseCase(id: IPhoto["_id"]): Promise<void> {
    await this.testedUseCase.execute(id);
  }

  async executeTestedUseCaseAndExpectToThrow(id: IPhoto["_id"]): Promise<void> {
    try {
      await this.executeTestedUseCase(id);
    } catch (err) {
      expect(err).toBeDefined();
    } finally {
      this.assertionsCounter.increase();
      this.assertionsCounter.checkAssertions();
    }
  }

  async insertPhotoInDbs(photo: IPhoto): Promise<void> {
    return await this.photoTestUtils.insertPhotoInDbs(photo);
  }

  async getPhotoFromDb(id: IPhoto["_id"]): Promise<IPhoto> {
    return await this.photoTestUtils.getPhotoFromDb(id);
  }

  async deletePhotoIfNecessary(id: IPhoto["_id"]): Promise<void> {
    return await this.photoTestUtils.deletePhotoIfNecessary(id);
  }

  async getPhotoMetadataFromDb(id: IPhoto["_id"]): Promise<IPhoto["metadata"]> {
    return await this.photoTestUtils.getPhotoMetadataDoc(id);
  }

  async expectPhotoToBeDeletedFromDbs(id: IPhoto["_id"]): Promise<void> {
    const photo = await this.getPhotoFromDb(id);
    expect(photo.imageBuffer).toBeUndefined();
    expect(photo.metadata).toBeUndefined();
    this.assertionsCounter.increase(2);
    this.assertionsCounter.checkAssertions();
  }

  async expectMetadataNotToBeDeleted(photo: IPhoto): Promise<void> {
    const metadataFromDb = await this.photoTestUtils.getPhotoMetadataDoc(
      photo._id,
    );
    expect(metadataFromDb).toBeDefined();
    expect(metadataFromDb).toEqual(photo.metadata);
    this.assertionsCounter.increase(2);
  }
}
