import { EntryPointId, IEntryPoints } from "../models";
import { Permission } from "../permission";
import { EntryPoint } from "./entry-point";

class EntryPoints implements IEntryPoints {
  private readonly base = new EntryPoint("/");

  private readonly photoBase = new EntryPoint("/photo", this.base, [
    Permission.PhotosRead,
  ]);
  private readonly getPhotoImage = new EntryPoint(
    "/:id/image",
    this.photoBase,
    [Permission.PhotosRead],
  );
  private readonly getPhotoMetadata = new EntryPoint(
    "/:id/metadata",
    this.photoBase,
    [Permission.PhotosRead],
  );

  private readonly adminBase = new EntryPoint("/admin", this.base, [
    Permission.RestrictedRead,
  ]);

  private readonly adminPhotoBase = new EntryPoint("/photo", this.adminBase);
  private readonly replacePhoto = new EntryPoint("/", this.adminPhotoBase, [
    Permission.PhotosWrite,
  ]);
  private readonly addPhoto = new EntryPoint("/", this.adminPhotoBase, [
    Permission.PhotosWrite,
  ]);
  private readonly deletePhoto = new EntryPoint("/:id", this.adminPhotoBase, [
    Permission.PhotosWrite,
  ]);

  private readonly entryPoints: Record<EntryPointId, EntryPoint> = {
    [EntryPointId.AdminBase]: this.adminBase,
    [EntryPointId.AdminPhotoBase]: this.adminPhotoBase,
    [EntryPointId.AddPhoto]: this.addPhoto,
    [EntryPointId.Base]: this.base,
    [EntryPointId.DeletePhoto]: this.deletePhoto,
    [EntryPointId.GetPhotoImage]: this.getPhotoImage,
    [EntryPointId.GetPhotoMetadata]: this.getPhotoMetadata,
    [EntryPointId.PhotoBase]: this.photoBase,
    [EntryPointId.ReplacePhoto]: this.replacePhoto,
  };

  get(id: EntryPointId) {
    return this.entryPoints[id];
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
