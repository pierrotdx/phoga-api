import { IAssertionsCounter } from "@assertions-counter";
import { ISearchPhotoOptions, SortDirection } from "@domain";
import { assertSearchPhotoOptions } from "@shared";

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

  expectValidType(
    parsedData: unknown,
    assertionsCounter: IAssertionsCounter,
  ): void {
    const isSearchPhotoOptions = assertSearchPhotoOptions(parsedData);
    expect(isSearchPhotoOptions).toBe(true);
    assertionsCounter.increase();
  }

  expectParsedDataMatchingInputData(
    parsedData: ISearchPhotoOptions,
    inputData: ReturnType<typeof this.generateInputData>,
    assertionsCounter: IAssertionsCounter,
  ): void {
    this.expectExcludeImagesToMatchInputData(
      parsedData,
      inputData,
      assertionsCounter,
    );
    this.expectRenderingSizeToMatchInputDate(
      parsedData,
      inputData,
      assertionsCounter,
    );
    this.expectRenderingFromToMatchInputDate(
      parsedData,
      inputData,
      assertionsCounter,
    );
    this.expectRenderingDateOrderToMatchInputDate(
      parsedData,
      inputData,
      assertionsCounter,
    );
  }

  private expectExcludeImagesToMatchInputData(
    parsedData: ISearchPhotoOptions,
    inputData: ReturnType<typeof this.generateInputData>,
    assertionsCounter: IAssertionsCounter,
  ): void {
    if (typeof inputData.excludeImages !== "undefined") {
      const stringifiedExcludeImages = JSON.stringify(parsedData.excludeImages);
      expect(stringifiedExcludeImages).toEqual(inputData.excludeImages);
      assertionsCounter.increase();
    }
  }

  private expectRenderingSizeToMatchInputDate(
    parsedData: ISearchPhotoOptions,
    inputData: ReturnType<typeof this.generateInputData>,
    assertionsCounter: IAssertionsCounter,
  ): void {
    if (typeof inputData.size !== "undefined") {
      const stringifiedSize = JSON.stringify(parsedData.rendering?.size);
      expect(stringifiedSize).toEqual(inputData.size);
      assertionsCounter.increase();
    }
  }

  private expectRenderingFromToMatchInputDate(
    parsedData: ISearchPhotoOptions,
    inputData: ReturnType<typeof this.generateInputData>,
    assertionsCounter: IAssertionsCounter,
  ): void {
    if (typeof inputData.from !== "undefined") {
      const stringifiedFrom = JSON.stringify(parsedData.rendering?.from);
      expect(stringifiedFrom).toEqual(inputData.from);
      assertionsCounter.increase();
    }
  }

  private expectRenderingDateOrderToMatchInputDate(
    parsedData: ISearchPhotoOptions,
    inputData: ReturnType<typeof this.generateInputData>,
    assertionsCounter: IAssertionsCounter,
  ): void {
    if (inputData.dateOrder) {
      expect(parsedData.rendering?.dateOrder).toEqual(inputData.dateOrder);
      assertionsCounter.increase();
    }
  }
}
