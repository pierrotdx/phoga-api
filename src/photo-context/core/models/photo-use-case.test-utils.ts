import { HttpErrorCode } from "#shared/models";

export interface IPhotoUseCaseTestUtils<TUseCaseResult> {
  executeTestedUseCase(...args: unknown[]): Promise<TUseCaseResult>;
  executeUseCaseAndExpectToThrow({
    useCaseParams,
    expectedStatus,
  }: {
    expectedStatus?: HttpErrorCode;
    useCaseParams: unknown[];
  }): Promise<void>;
}
