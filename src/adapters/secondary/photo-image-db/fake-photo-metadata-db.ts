import { clone } from "ramda";
import {
  IPhoto,
  IPhotoMetadata,
  IPhotoMetadataDb,
  Photo,
} from "../../../business-logic";

export class FakePhotoMetadataDb implements IPhotoMetadataDb {
  public readonly docs: Record<Photo["_id"], IPhotoMetadata> = {};

  async insert(photo: IPhoto) {
    if (photo.metadata) {
      this.docs[photo._id] = photo.metadata;
    }
  }

  async getById(id: IPhoto["_id"]): Promise<IPhotoMetadata> {
    return clone(this.docs[id]);
  }

  async delete(id: IPhoto["_id"]): Promise<void> {
    delete this.docs[id];
  }

  async replace(photo: IPhoto): Promise<void> {
    this.docs[photo._id] = photo.metadata;
  }
}
