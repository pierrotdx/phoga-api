import { IParsers } from "@http-server";
import { Factory } from "@shared";

import { AddPhotoParser } from "./add-photo/add-photo.parser";
import { GetPhotoParser } from "./get-photo/get-photo.parser";
import { SearchPhotoParser } from "./search-photo/search-photo.parser";
import { DeletePhotoParser } from "./delete-photo/delete-photo.parser";

export class ParsersFactory implements Factory<IParsers> {
  create(): IParsers {
    return {
      getPhoto: new GetPhotoParser(),
      addPhoto: new AddPhotoParser(),
      replacePhoto: new AddPhotoParser(),
      deletePhoto: new DeletePhotoParser(),
      searchPhoto: new SearchPhotoParser(),
    };
  }
}
