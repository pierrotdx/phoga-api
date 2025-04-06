import { EntryPoint, IEntryPoints } from "@shared/entry-points";
import { Permission } from "@shared/models";

import { PhotoEntryPointId } from "../../models";

class EntryPoints implements IEntryPoints<PhotoEntryPointId> {
  private readonly base = new EntryPoint("/");

  private readonly photoBase = new EntryPoint("/photo", {
    parent: this.base,
    permissions: [Permission.PhotosRead],
  });
  private readonly getPhotoImage = new EntryPoint("/:id/image", {
    parent: this.photoBase,
    permissions: [Permission.PhotosRead],
  });
  private readonly getPhotoMetadata = new EntryPoint("/:id/metadata", {
    parent: this.photoBase,
    permissions: [Permission.PhotosRead],
  });
  private readonly searchPhoto = new EntryPoint("/", {
    parent: this.photoBase,
  });

  private readonly adminBase = new EntryPoint("/admin", {
    parent: this.base,
    permissions: [Permission.RestrictedRead],
  });

  private readonly adminPhotoBase = new EntryPoint("/photo", {
    parent: this.adminBase,
  });
  private readonly replacePhoto = new EntryPoint("/", {
    parent: this.adminPhotoBase,
    permissions: [Permission.PhotosWrite],
  });
  private readonly addPhoto = new EntryPoint("/", {
    parent: this.adminPhotoBase,
    permissions: [Permission.PhotosWrite],
  });
  private readonly deletePhoto = new EntryPoint("/:id", {
    parent: this.adminPhotoBase,
    permissions: [Permission.PhotosWrite],
  });

  private readonly entryPoints: Record<PhotoEntryPointId, EntryPoint> = {
    [PhotoEntryPointId.AdminBase]: this.adminBase,
    [PhotoEntryPointId.AdminPhotoBase]: this.adminPhotoBase,
    [PhotoEntryPointId.AddPhoto]: this.addPhoto,
    [PhotoEntryPointId.Base]: this.base,
    [PhotoEntryPointId.DeletePhoto]: this.deletePhoto,
    [PhotoEntryPointId.GetPhotoImage]: this.getPhotoImage,
    [PhotoEntryPointId.GetPhotoMetadata]: this.getPhotoMetadata,
    [PhotoEntryPointId.PhotoBase]: this.photoBase,
    [PhotoEntryPointId.ReplacePhoto]: this.replacePhoto,
    [PhotoEntryPointId.SearchPhoto]: this.searchPhoto,
  };

  get(id: PhotoEntryPointId) {
    return this.entryPoints[id];
  }

  getRelativePath(id: PhotoEntryPointId): string {
    return this.entryPoints[id].getRelativePath();
  }

  getFullPathRaw(id: PhotoEntryPointId): string {
    return this.entryPoints[id].getFullPathRaw();
  }

  getFullPathWithParams(id: PhotoEntryPointId, params: any): string {
    return this.entryPoints[id].getFullPathWithParams(params);
  }

  getPermissions(id: PhotoEntryPointId): Permission[] {
    return this.entryPoints[id].getPermissions();
  }
}

export const entryPoints = new EntryPoints();
