import { IPhotoImageDb, IPhotoMetadataDb } from "@business-logic";

export interface IDbsTestUtilsParams {
  metadataDb?: IPhotoMetadataDb;
  imageDb?: IPhotoImageDb;
}
