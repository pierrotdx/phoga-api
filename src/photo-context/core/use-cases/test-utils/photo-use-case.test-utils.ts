import { ErrorWithStatus, HttpErrorCode, IUseCase } from "#shared/models";
import { IPhotoExpectsTestUtils } from "#shared/test-utils";
import { ITagDb } from "#tag-context";

import { IPhotoUseCaseTestUtils } from "../../models";

export class PhotoUseCaseTestUtils<TUseCaseResult>
  implements IPhotoUseCaseTestUtils<TUseCaseResult>
{
  constructor(
    protected testedUseCase: IUseCase<TUseCaseResult>,
    private readonly photoExpects: IPhotoExpectsTestUtils,
    protected readonly tagDb?: ITagDb,
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
      if (expectedStatus) {
        const error = err as ErrorWithStatus;
        expect(error.status).toBe(expectedStatus);
      }
    } finally {
      this.photoExpects.increaseAssertionsCounter();
      if (expectedStatus) {
        this.photoExpects.increaseAssertionsCounter();
      }
      this.photoExpects.checkAssertions();
    }
  }
}
