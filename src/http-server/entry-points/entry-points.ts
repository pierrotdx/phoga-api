import { EntryPointId, IEntryPoints } from "../models";
import { Scope } from "../scope";
import { EntryPoint } from "./entry-point";

class EntryPoints implements IEntryPoints {
  private readonly base = new EntryPoint("/");

  private readonly photoBase = new EntryPoint("/photo", this.base, [
    Scope.PhotosRead,
  ]);
  private readonly getPhotoImage = new EntryPoint(
    "/:id/image",
    this.photoBase,
    [Scope.PhotosRead],
  );
  private readonly getPhotoMetadata = new EntryPoint(
    "/:id/metadata",
    this.photoBase,
    [Scope.PhotosRead],
  );
  private readonly searchPhoto = new EntryPoint("/", this.photoBase);

  private readonly adminBase = new EntryPoint("/admin", this.base, [
    Scope.RestrictedRead,
  ]);

  private readonly adminPhotoBase = new EntryPoint("/photo", this.adminBase);
  private readonly replacePhoto = new EntryPoint("/", this.adminPhotoBase, [
    Scope.PhotosWrite,
  ]);
  private readonly addPhoto = new EntryPoint("/", this.adminPhotoBase, [
    Scope.PhotosWrite,
  ]);
  private readonly deletePhoto = new EntryPoint("/:id", this.adminPhotoBase, [
    Scope.PhotosWrite,
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
    [EntryPointId.SearchPhoto]: this.searchPhoto,
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

  getScopes(id: EntryPointId): Scope[] {
    return this.entryPoints[id].getScopes();
  }
}

export const entryPoints = new EntryPoints();
