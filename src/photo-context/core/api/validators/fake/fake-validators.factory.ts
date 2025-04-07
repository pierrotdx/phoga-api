import { Factory } from "#shared/models";

import { IValidators } from "../../../models";
import { AddPhotoFakeValidator } from "./add-photo.fake-validator";
import { DeletePhotoFakeValidator } from "./delete-photo.fake-validator";
import { GetPhotoFakeValidator } from "./get-photo.fake-validator";
import { ReplacePhotoFakeValidator } from "./replace-photo.fake-validator";
import { SearchPhotoFakeValidator } from "./search-photo.fake-validator";

export class FakeValidatorsFactory implements Factory<IValidators> {
  create(): IValidators {
    return {
      getPhoto: new GetPhotoFakeValidator(),
      addPhoto: new AddPhotoFakeValidator(),
      replacePhoto: new ReplacePhotoFakeValidator(),
      deletePhoto: new DeletePhotoFakeValidator(),
      searchPhoto: new SearchPhotoFakeValidator(),
    };
  }
}
