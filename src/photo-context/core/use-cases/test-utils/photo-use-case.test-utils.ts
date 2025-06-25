import { ErrorWithStatus, HttpErrorCode, IUseCase } from "#shared/models";
import { IPhotoExpectsTestUtils } from "#shared/test-utils";
import { ITagDb } from "#tag-context";
import { IPhotoImageDb } from "photo-context/core/gateways";

import { IPhoto, IPhotoUseCaseTestUtils } from "../../models";

export class PhotoUseCaseTestUtils<TUseCaseResult>
  implements IPhotoUseCaseTestUtils<TUseCaseResult>
{
  constructor(
    protected testedUseCase: IUseCase<TUseCaseResult>,
    private readonly photoExpects: IPhotoExpectsTestUtils,
    protected readonly tagDb?: ITagDb,
    private readonly photoImageDb?: IPhotoImageDb,
  ) {}

  executeTestedUseCase = async (...args: unknown[]): Promise<TUseCaseResult> =>
    await this.testedUseCase.execute(...args);

  async executeUseCaseAndExpectToThrow({
    useCaseParams,
    expectedStatus,
  }: {
    expectedStatus?: HttpErrorCode;
    useCaseParams: unknown[];
  }): Promise<void> {
    try {
      await this.testedUseCase.execute(...useCaseParams);
    } catch (err) {
      expect(err).toBeDefined();
      this.photoExpects.increaseAssertionsCounter();

      if (expectedStatus) {
        const error = err as ErrorWithStatus;
        expect(error.status).toBe(expectedStatus);
        this.photoExpects.increaseAssertionsCounter();
      }
    } finally {
      this.photoExpects.checkAssertions();
    }
  }

  async addImageUrls(photos: IPhoto[]): Promise<void> {
    const addImageUrls$ = photos.map(async (p) => {
      const imageUrl = await this.photoImageDb.getUrl(p._id);
      p.imageUrl = imageUrl;
      return p;
    });
    await Promise.all(addImageUrls$);
  }
}
