import { clone, pick } from "ramda";

import { IPhoto, IPhotoImageDb } from "../../../../core";

export class FakePhotoImageDb implements IPhotoImageDb {
  public readonly photoImages: Record<IPhoto["_id"], IPhoto["imageBuffer"]> =
    {};

  async insert(photo: IPhoto): Promise<void> {
    this.photoImages[photo._id] = photo.imageBuffer;
  }

  async getById(id: IPhoto["_id"]): Promise<Buffer> {
    return clone(this.photoImages[id]);
  }

  async getByIds(ids: IPhoto["_id"][]): Promise<Record<IPhoto["_id"], Buffer>> {
    const images = pick(ids, this.photoImages);
    return clone(images);
  }

  async delete(id: IPhoto["_id"]): Promise<void> {
    delete this.photoImages[id];
  }

  async replace(photo: IPhoto): Promise<void> {
    this.photoImages[photo._id] = photo.imageBuffer;
  }

  async checkExists(id: IPhoto["_id"]): Promise<boolean> {
    return !!this.photoImages[id];
  }
}
