import { isEmpty } from "ramda";

import {
  IRendering,
  ISearchPhotoOptions,
  SortDirection,
} from "@business-logic";
import { ISearchPhotoValidator, TSchema, TValidatorData } from "@http-server";

import { AjvValidator } from "./ajv-validator";

export class SearchPhotoAjvValidator implements ISearchPhotoValidator {
  private ajvValidator = new AjvValidator();

  validateAndParse(schema: TSchema, data: TValidatorData): ISearchPhotoOptions {
    const searchOptions = this.parse(data);
    this.ajvValidator.validate(schema, searchOptions);
    return searchOptions;
  }

  private parse(data: TValidatorData): ISearchPhotoOptions {
    const options: ISearchPhotoOptions = {};
    const rendering = this.parseRendering(data);
    if (rendering) {
      options.rendering = rendering;
    }
    if (data.excludeImages) {
      options.excludeImages = data.excludeImages === "true";
    }
    return options;
  }

  private parseRendering(data: TValidatorData): IRendering {
    const { from, size, date } = data as Record<string, string>;
    const rendering: IRendering = {};
    if (from) {
      rendering.from = parseInt(from);
    }
    if (size) {
      rendering.size = parseInt(size);
    }
    if (date) {
      const isSortDirection = (
        Object.values(SortDirection) as string[]
      ).includes(date);
      if (!isSortDirection) {
        throw new Error("date: invalid sort direction");
      }
      rendering.date = date as SortDirection;
    }
    return !isEmpty(rendering) ? rendering : undefined;
  }
}
