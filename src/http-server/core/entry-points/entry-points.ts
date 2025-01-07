import { EntryPointId, IEntryPoints } from "../models";
import { Scope } from "../scope";
import { EntryPoint } from "./entry-point";

class EntryPoints implements IEntryPoints {
  private readonly base = new EntryPoint("/");

  private readonly photoBase = new EntryPoint("/photo", {
    parent: this.base,
    scopes: [Scope.PhotosRead],
  });
  private readonly getPhotoImage = new EntryPoint("/:id/image", {
    parent: this.photoBase,
    scopes: [Scope.PhotosRead],
  });
  private readonly getPhotoMetadata = new EntryPoint("/:id/metadata", {
    parent: this.photoBase,
    scopes: [Scope.PhotosRead],
  });
  private readonly searchPhoto = new EntryPoint("/", {
    parent: this.photoBase,
  });

  private readonly adminBase = new EntryPoint("/admin", {
    parent: this.base,
    scopes: [Scope.RestrictedRead],
  });

  private readonly adminPhotoBase = new EntryPoint("/photo", {
    parent: this.adminBase,
  });
  private readonly replacePhoto = new EntryPoint("/", {
    parent: this.adminPhotoBase,
    scopes: [Scope.PhotosWrite],
  });
  private readonly addPhoto = new EntryPoint("/", {
    parent: this.adminPhotoBase,
    scopes: [Scope.PhotosWrite],
  });
  private readonly deletePhoto = new EntryPoint("/:id", {
    parent: this.adminPhotoBase,
    scopes: [Scope.PhotosWrite],
  });

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

  getFullPathRaw(id: EntryPointId): string {
    return this.entryPoints[id].getFullPathRaw();
  }

  getFullPathWithParams(id: EntryPointId, params: any): string {
    return this.entryPoints[id].getFullPathWithParams(params);
  }

  getScopes(id: EntryPointId): Scope[] {
    return this.entryPoints[id].getScopes();
  }
}

export const entryPoints = new EntryPoints();
