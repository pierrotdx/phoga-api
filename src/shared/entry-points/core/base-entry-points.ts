import { Permission } from "#shared/models";

import { EntryPoint } from "./entry-point/entry-point";
import { EntryPoints } from "./entry-points";
import { BaseEntryPointsId, IEntryPoints } from "./models";

export class BaseEntryPoints
  extends EntryPoints<BaseEntryPointsId>
  implements IEntryPoints<BaseEntryPointsId>
{
  private readonly base = new EntryPoint("/");

  private readonly adminBase = new EntryPoint("/admin", {
    parent: this.base,
    permissions: [Permission.RestrictedRead],
  });

  private readonly adminPhotoBase = new EntryPoint("/photo", {
    parent: this.adminBase,
  });

  private readonly photoBase = new EntryPoint("/photo", {
    parent: this.base,
    permissions: [Permission.PhotosRead],
  });

  protected readonly entryPoints: Record<BaseEntryPointsId, EntryPoint> = {
    [BaseEntryPointsId.AdminBase]: this.adminBase,
    [BaseEntryPointsId.AdminPhotoBase]: this.adminPhotoBase,

    [BaseEntryPointsId.Base]: this.base,

    [BaseEntryPointsId.PhotoBase]: this.photoBase,
  };
}
