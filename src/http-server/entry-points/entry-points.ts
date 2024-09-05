import { Permission } from "../permission";
import { IEntryPoints, EntryPointId } from "../models";
import { EntryPoint } from "./entry-point";

class EntryPoints implements IEntryPoints {

  private readonly base = new EntryPoint("/");

  private readonly photo = new EntryPoint("/photo", [this.base], [Permission.PhotosRead]);
  private readonly getPhotoImage = new EntryPoint("/:id/image", [this.base, this.photo], [Permission.PhotosRead]);
  private readonly getPhotoMetadata = new EntryPoint("/:id/metadata", [this.base, this.photo], [Permission.PhotosRead]);
  private readonly replacePhoto = new EntryPoint("/", [this.base, this.photo], [Permission.PhotosWrite]);
  private readonly addPhoto = new EntryPoint("/", [this.base, this.photo], [Permission.PhotosWrite]);
  private readonly deletePhoto = new EntryPoint("/:id", [this.base, this.photo], [Permission.PhotosWrite]);

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

  getPermissions(id: EntryPointId): Permission[] {
    return this.entryPoints[id].getPermissions();
  }
}

export const entryPoints = new EntryPoints();