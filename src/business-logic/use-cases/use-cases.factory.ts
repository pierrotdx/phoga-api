import { Factory } from "@utils";

import { IPhotoImageDb, IPhotoMetadataDb } from "../gateways";
import { IUseCases } from "../models";
import { AddPhoto } from "./add-photo/add-photo";
import { DeletePhoto } from "./delete-photo/delete-photo";
import { GetPhoto } from "./get-photo/get-photo";
import { ReplacePhoto } from "./replace-photo/replace-photo";
import { SearchPhoto } from "./search-photo/search-photo";

export class UseCasesFactory implements Factory<IUseCases> {
  constructor(
    private readonly metadataDb: IPhotoMetadataDb,
    private readonly imageDb: IPhotoImageDb,
  ) {}

  create(): IUseCases {
    return {
      getPhoto: new GetPhoto(this.metadataDb, this.imageDb),
      addPhoto: new AddPhoto(this.metadataDb, this.imageDb),
      replacePhoto: new ReplacePhoto(this.metadataDb, this.imageDb),
      deletePhoto: new DeletePhoto(this.metadataDb, this.imageDb),
      searchPhoto: new SearchPhoto(this.metadataDb, this.imageDb),
    };
  }
}
