import {
  BaseEntryPoints,
  BaseEntryPointsId,
  EntryPoint,
  EntryPoints,
  IEntryPoints,
} from "#shared/entry-points";
import { Permission } from "#shared/models";

import { PhotoEntryPointId } from "../../models";

export class PhotoEntryPoints
  extends EntryPoints<PhotoEntryPointId>
  implements IEntryPoints<PhotoEntryPointId>
{
  private readonly baseEntryPoints = new BaseEntryPoints();

  private readonly photoBase = this.baseEntryPoints.get(
    BaseEntryPointsId.PhotoBase,
  );

  private readonly adminPhotoBase = this.baseEntryPoints.get(
    BaseEntryPointsId.AdminPhotoBase,
  );

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

  protected readonly entryPoints: Record<PhotoEntryPointId, EntryPoint> = {
    [PhotoEntryPointId.AddPhoto]: this.addPhoto,
    [PhotoEntryPointId.DeletePhoto]: this.deletePhoto,
    [PhotoEntryPointId.GetPhotoImage]: this.getPhotoImage,
    [PhotoEntryPointId.GetPhotoMetadata]: this.getPhotoMetadata,
    [PhotoEntryPointId.ReplacePhoto]: this.replacePhoto,
    [PhotoEntryPointId.SearchPhoto]: this.searchPhoto,
  };
}
