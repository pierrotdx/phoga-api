import {
  AssertionsCounter,
  IAssertionsCounter,
} from "@shared/assertions-counter";

import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { IPhoto } from "../../models";
import { PhotoTestUtils } from "../../test-utils";
import { AddPhotoUseCase } from "./add-photo";

export class AddPhotoTestUtils {
  private readonly testedUseCase: AddPhotoUseCase;

  private readonly photoTestUtils: PhotoTestUtils;
  private readonly assertionsCounter: IAssertionsCounter =
    new AssertionsCounter();

  constructor(
    public readonly photoMetadataDb: IPhotoMetadataDb,
    public readonly photoImageDb: IPhotoImageDb,
  ) {
    this.testedUseCase = new AddPhotoUseCase(
      this.photoMetadataDb,
      this.photoImageDb,
    );
    this.photoTestUtils = new PhotoTestUtils(
      this.photoMetadataDb,
      this.photoImageDb,
    );
  }

  async executeTestedUseCase(photo: IPhoto): Promise<void> {
    await this.testedUseCase.execute(photo);
  }

  async expectPhotoToBeUploaded(photo: IPhoto): Promise<void> {
    await this.photoTestUtils.expectPhotoToBeUploaded(
      photo,
      this.assertionsCounter,
    );
    this.assertionsCounter.checkAssertions();
  }

  async executeUseCaseAndExpectToThrow(photo: IPhoto): Promise<void> {
    try {
      await this.executeTestedUseCase(photo);
    } catch (err) {
      expect(err).toBeDefined();
    } finally {
      this.assertionsCounter.increase();
      this.assertionsCounter.checkAssertions();
    }
  }
}
