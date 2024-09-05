import { IEntryPoints, EntryPointId } from "../models";
import { EntryPoint } from "./entry-point";

class EntryPoints implements IEntryPoints {

  private readonly base = new EntryPoint("/");

  private readonly photo = new EntryPoint("/photo", [this.base]);
  private readonly getPhotoImage = new EntryPoint("/:id/image", [this.base, this.photo]);
  private readonly getPhotoMetadata = new EntryPoint("/:id/metadata", [this.base, this.photo]);
  private readonly replacePhoto = new EntryPoint("/", [this.base, this.photo]);
  private readonly addPhoto = new EntryPoint("/", [this.base, this.photo]);
  private readonly deletePhoto = new EntryPoint("/:id", [this.base, this.photo]);

  private readonly entryPoints: Record<EntryPointId, EntryPoint> = {
    [EntryPointId.Base]: this.base,
    [EntryPointId.PhotoBase]: this.photo,
    [EntryPointId.AddPhoto]: this.addPhoto,
    [EntryPointId.DeletePhoto]: this.deletePhoto,
    [EntryPointId.GetPhotoImage]: this.getPhotoImage,
    [EntryPointId.GetPhotoMetadata]: this.getPhotoMetadata,
    [EntryPointId.ReplacePhoto]: this.replacePhoto,
}

  getRelativePath(id: EntryPointId): string {
    return this.entryPoints[id].getRelativePath();
  }

  getFullPath(id: EntryPointId): string {
    return this.entryPoints[id].getFullPath();
  }
}

export const entryPoints = new EntryPoints();