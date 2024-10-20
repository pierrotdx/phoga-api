import { clone } from "ramda";

import {
  IPhoto,
  IPhotoMetadata,
  IPhotoMetadataDb,
  IRendering,
  Photo,
  SortDirection,
} from "@business-logic";
import { comparePhotoDates } from "@utils";

export class FakePhotoMetadataDb implements IPhotoMetadataDb {
  public readonly docs: Record<IPhoto["_id"], IPhotoMetadata> = {};

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

  async find(rendering?: IRendering): Promise<IPhoto[]> {
    let photos = this.getPhotosFromDocs();
    if (rendering?.dateOrder) {
      this.sortByDate(photos, rendering.dateOrder);
    }
    if (typeof rendering?.size === "number") {
      const deleteCount =
        photos.length > rendering?.size ? photos.length - rendering?.size : 0;
      photos.splice(0, deleteCount);
    }
    if (typeof rendering?.from === "number") {
      photos = photos.slice(rendering.from - 1);
    }
    return photos;
  }

  private getPhotosFromDocs(): IPhoto[] {
    const docs = clone(this.docs);
    const photoIds = Object.keys(docs);
    const photos = photoIds.map(
      (id: IPhoto["_id"]) => new Photo(id, { metadata: docs[id] }),
    );
    return photos;
  }

  private sortByDate(photos: IPhoto[], order: SortDirection) {
    photos.sort(comparePhotoDates);
    if (order === SortDirection.Descending) {
      photos.reverse();
    }
    return photos;
  }
}
