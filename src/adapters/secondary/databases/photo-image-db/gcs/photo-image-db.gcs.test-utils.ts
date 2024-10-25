import { readFile } from "fs/promises";
import { randomInt } from "node:crypto";

import {
  IPhoto,
  IPhotoImageDb,
  IPhotoMetadataDb,
  Photo,
} from "@business-logic";
import { DbsTestUtils, IAssertionsCounter } from "@utils";

import { dumbPhotoGenerator } from "../../../../primary/dumb-photo-generator";

export class PhotoImageDbGcsTestUtils extends DbsTestUtils {
  constructor(metadataDb?: IPhotoMetadataDb, imageDb?: IPhotoImageDb) {
    super(metadataDb, imageDb);
  }

  generatePhotos(nbPhotos: number): IPhoto[] {
    const photos: IPhoto[] = [];
    for (let index = 0; index < nbPhotos; index++) {
      photos.push(
        dumbPhotoGenerator.generate({
          imageBuffer: Buffer.from("dumb image buffer"),
        }),
      );
    }
    return photos;
  }

  async generatePhotoFromAssets(
    imagePath: string,
    _id?: IPhoto["_id"],
  ): Promise<Photo> {
    const imageBuffer = await readFile(imagePath);
    const photo = dumbPhotoGenerator.generate({ _id, imageBuffer });
    return photo;
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
    const dbImage = await this.getPhotoImageFromDb(photo._id);
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
    const imageFromDb = await this.getPhotoImageFromDb(replacingPhoto._id);
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
    const dbImageAfter = await this.getPhotoImageFromDb(photo._id);
    expect(dbImageBefore).toBeDefined();
    expect(dbImageBefore).toEqual(photo.imageBuffer);
    expect(dbImageAfter).toBeUndefined();
    assertionsCounter.increase(3);
  }
}
