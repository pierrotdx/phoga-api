import { IRendering, SortDirection } from "#shared/models";
import { clone, omit } from "ramda";

import {
  IPhoto,
  IPhotoData,
  IPhotoDataDb,
  IPhotoStoredData,
  comparePhotoDates,
} from "../../../..";

export class FakePhotoDataDb implements IPhotoDataDb {
  public readonly docs: Record<IPhoto["_id"], IPhotoData> = {};

  async insert(photo: IPhotoStoredData) {
    const storePhoto: IPhotoData = this.getPhotoData(photo);
    this.docs[photo._id] = storePhoto;
  }

  async getById(id: IPhoto["_id"]): Promise<IPhotoData> {
    return clone(this.docs[id]);
  }

  async delete(id: IPhoto["_id"]): Promise<void> {
    delete this.docs[id];
  }

  async replace(photo: IPhotoStoredData): Promise<void> {
    this.docs[photo._id] = this.getPhotoData(photo);
  }

  private getPhotoData(photo: IPhoto): IPhotoData {
    return omit(["imageBuffer"], photo);
  }

  async find(rendering?: IRendering): Promise<IPhotoStoredData[]> {
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
    return Object.values(docs);
  }

  private sortByDate(photos: IPhoto[], order: SortDirection) {
    photos.sort(comparePhotoDates);
    if (order === SortDirection.Descending) {
      photos.reverse();
    }
    return photos;
  }
}
