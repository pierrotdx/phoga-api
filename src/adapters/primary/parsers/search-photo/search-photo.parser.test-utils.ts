import { ISearchPhotoOptions, SortDirection } from "@business-logic";
import { Counter, assertSearchPhotoOptions } from "@utils";

export class SearchPhotoParserTestUtils {
  generateInputData(
    excludesImages: boolean = true,
    dateOrder: string = SortDirection.Ascending,
  ) {
    return {
      excludeImages: JSON.stringify(excludesImages),
      size: Math.floor(Math.random() * 100).toString(),
      from: Math.floor(Math.random() * 100).toString(),
      dateOrder,
    };
  }

  expectValidType(parsedData: unknown, assertionCounter: Counter): void {
    const isSearchPhotoOptions = assertSearchPhotoOptions(parsedData);
    expect(isSearchPhotoOptions).toBe(true);
    assertionCounter.increase();
  }

  expectParsedDataMatchingInputData(
    parsedData: ISearchPhotoOptions,
    inputData: ReturnType<typeof this.generateInputData>,
    assertionCounter: Counter,
  ): void {
    this.expectExcludeImagesToMatchInputData(
      parsedData,
      inputData,
      assertionCounter,
    );
    this.expectRenderingSizeToMatchInputDate(
      parsedData,
      inputData,
      assertionCounter,
    );
    this.expectRenderingFromToMatchInputDate(
      parsedData,
      inputData,
      assertionCounter,
    );
    this.expectRenderingDateOrderToMatchInputDate(
      parsedData,
      inputData,
      assertionCounter,
    );
  }

  private expectExcludeImagesToMatchInputData(
    parsedData: ISearchPhotoOptions,
    inputData: ReturnType<typeof this.generateInputData>,
    assertionCounter: Counter,
  ): void {
    if (typeof inputData.excludeImages !== "undefined") {
      const stringifiedExcludeImages = JSON.stringify(parsedData.excludeImages);
      expect(stringifiedExcludeImages).toEqual(inputData.excludeImages);
      assertionCounter.increase();
    }
  }

  private expectRenderingSizeToMatchInputDate(
    parsedData: ISearchPhotoOptions,
    inputData: ReturnType<typeof this.generateInputData>,
    assertionCounter: Counter,
  ): void {
    if (typeof inputData.size !== "undefined") {
      const stringifiedSize = JSON.stringify(parsedData.rendering?.size);
      expect(stringifiedSize).toEqual(inputData.size);
      assertionCounter.increase();
    }
  }

  private expectRenderingFromToMatchInputDate(
    parsedData: ISearchPhotoOptions,
    inputData: ReturnType<typeof this.generateInputData>,
    assertionCounter: Counter,
  ): void {
    if (typeof inputData.from !== "undefined") {
      const stringifiedFrom = JSON.stringify(parsedData.rendering?.from);
      expect(stringifiedFrom).toEqual(inputData.from);
      assertionCounter.increase();
    }
  }

  private expectRenderingDateOrderToMatchInputDate(
    parsedData: ISearchPhotoOptions,
    inputData: ReturnType<typeof this.generateInputData>,
    assertionCounter: Counter,
  ): void {
    if (inputData.dateOrder) {
      expect(parsedData.rendering?.dateOrder).toEqual(inputData.dateOrder);
      assertionCounter.increase();
    }
  }
}
