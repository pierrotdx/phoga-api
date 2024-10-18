import { isEmpty, omit } from "ramda";

import { IRendering, ISearchPhotoOptions } from "@business-logic";
import { ISearchPhotoValidator, TSchema, TValidatorData } from "@http-server";

export class SearchPhotoFakeValidator implements ISearchPhotoValidator {
  validateAndParse(schema: TSchema, data: TValidatorData): ISearchPhotoOptions {
    const options: ISearchPhotoOptions = {};
    const rendering = this.getRendering(data);
    if (!isEmpty(rendering)) {
      options.rendering = rendering;
    }
    if (data.excludeImages) {
      options.excludeImages = data.excludeImages === "true";
    }
    return options;
  }

  private getRendering(data: TValidatorData): IRendering {
    const fields = omit(["excludeImages"], data);
    const rendering: IRendering = {};
    if (fields.size) {
      rendering.size = parseInt(fields.size as string);
    }
    if (fields.from) {
      rendering.from = parseInt(fields.from as string);
    }
    return rendering;
  }
}
