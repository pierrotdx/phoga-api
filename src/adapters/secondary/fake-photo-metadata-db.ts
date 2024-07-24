import { clone } from "ramda";
import { IPhoto, IPhotoMetadata, Photo } from "../../business-logic/models";
import { IPhotoMetadataDb } from "../../business-logic/gateways";

export class FakePhotoMetadataDb implements IPhotoMetadataDb {
  public readonly docs: Record<Photo["_id"], IPhotoMetadata> = {};

  save = async (photo: IPhoto): Promise<void> => {
    if (photo.metadata) {
      this.docs[photo._id] = photo.metadata;
    }
  };

  getById = async (id: IPhoto["_id"]): Promise<IPhotoMetadata> => {
    return clone(this.docs[id]);
  };
}
