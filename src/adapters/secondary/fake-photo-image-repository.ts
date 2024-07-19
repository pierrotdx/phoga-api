import { mkdir, writeFile, readFile, rm } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { IPhotoImageRepository } from "../../business-logic/gateways";
import { Photo } from "../../business-logic/models";

export class FakePhotoImageRepository implements IPhotoImageRepository {
  private readonly dir = "tmp";

  constructor() {}

  save = async (photo: Photo): Promise<void> => {
    if (!photo.imageBuffer) {
      return;
    }
    const path = this.getPhotoPath(photo._id);
    await writeFile(path, photo.imageBuffer);
  };

  getById = async (id: Photo["_id"]): Promise<Buffer> => {
    const path = this.getPhotoPath(id);
    return await readFile(path);
  };

  public readonly createDir = async () => {
    if (!existsSync(this.dir)) {
      await mkdir(this.dir);
    }
  };

  public readonly removeDir = async () => {
    if (existsSync(this.dir)) {
      await rm(this.dir, {
        recursive: true,
        force: true,
        maxRetries: 1,
      });
    }
  };

  private readonly getPhotoPath = (id: Photo["_id"]) => join(this.dir, id);
}
