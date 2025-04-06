import { Factory } from "@shared/models";
import { AjvValidator } from "@shared/validators";

import {
  AddPhotoSchema,
  DeletePhotoSchema,
  GetPhotoSchema,
  IValidators,
  ReplacePhotoSchema,
  SearchPhotoSchema,
} from "../../../core";

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
