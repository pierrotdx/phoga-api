import { clone } from "ramda";
import { IPhotoImageDb } from "../../business-logic/gateways";
import { IPhoto } from "../../business-logic/models";

export class FakePhotoImageDb implements IPhotoImageDb {
  public readonly photoImages: Record<IPhoto["_id"], IPhoto["imageBuffer"]> =
    {};

  async save(photo: IPhoto): Promise<void> {
    this.photoImages[photo._id] = photo.imageBuffer;
  }
  async getById(id: IPhoto["_id"]): Promise<Buffer> {
    return clone(this.photoImages[id]);
  }

  async delete(id: IPhoto["_id"]): Promise<void> {
    delete this.photoImages[id];
  }
}
