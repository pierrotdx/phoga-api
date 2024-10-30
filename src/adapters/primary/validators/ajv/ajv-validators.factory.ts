import { AddPhotoSchema, DeletePhotoSchema, GetPhotoSchema, IValidators, ReplacePhotoSchema, SearchPhotoSchema } from "@http-server";
import { Factory } from "@utils";

import { AjvValidator } from "./ajv-validator";

export class AjvValidatorsFactory implements Factory<IValidators> {
  create(): IValidators {
    return {
        getPhoto: new AjvValidator(GetPhotoSchema),
        addPhoto: new AjvValidator(AddPhotoSchema),
        replacePhoto: new AjvValidator(ReplacePhotoSchema),
        deletePhoto: new AjvValidator(DeletePhotoSchema),
        searchPhoto: new AjvValidator(SearchPhotoSchema),
      };
  }
}