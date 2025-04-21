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

  private readonly photoData = this.baseEntryPoints.get(
    BaseEntryPointsId.PhotoData,
  );

  private readonly adminPhotoData = this.baseEntryPoints.get(
    BaseEntryPointsId.AdminPhotoData,
  );

  private readonly getPhotoImage = new EntryPoint("/:id/image", {
    parent: this.photoData,
    permissions: [Permission.PhotosRead],
  });

  private readonly getPhotoData = new EntryPoint("/:id/base", {
    parent: this.photoData,
    permissions: [Permission.PhotosRead],
  });

  private readonly searchPhoto = new EntryPoint("/", {
    parent: this.photoData,
  });

  private readonly replacePhoto = new EntryPoint("/", {
    parent: this.adminPhotoData,
    permissions: [Permission.PhotosWrite],
  });

  private readonly addPhoto = new EntryPoint("/", {
    parent: this.adminPhotoData,
    permissions: [Permission.PhotosWrite],
  });

  private readonly deletePhoto = new EntryPoint("/:id", {
    parent: this.adminPhotoData,
    permissions: [Permission.PhotosWrite],
  });

  protected readonly entryPoints: Record<PhotoEntryPointId, EntryPoint> = {
    [PhotoEntryPointId.AddPhoto]: this.addPhoto,
    [PhotoEntryPointId.DeletePhoto]: this.deletePhoto,
    [PhotoEntryPointId.GetPhotoImage]: this.getPhotoImage,
    [PhotoEntryPointId.GetPhotoData]: this.getPhotoData,
    [PhotoEntryPointId.ReplacePhoto]: this.replacePhoto,
    [PhotoEntryPointId.SearchPhoto]: this.searchPhoto,
  };
}
