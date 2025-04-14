import { Permission } from "#shared/models";

import { EntryPoint } from "./entry-point/entry-point";
import { EntryPoints } from "./entry-points";
import { BaseEntryPointsId, IEntryPoints } from "./models";

export class BaseEntryPoints
  extends EntryPoints<BaseEntryPointsId>
  implements IEntryPoints<BaseEntryPointsId>
{
  private readonly base = new EntryPoint("/");

  private readonly photoData = new EntryPoint("/photo", {
    parent: this.base,
  });

  private readonly tagBase = new EntryPoint("/tag", {
    parent: this.base,
  });

  private readonly adminBase = new EntryPoint("/admin", {
    parent: this.base,
    permissions: [Permission.RestrictedRead],
  });

  private readonly adminPhotoData = new EntryPoint("/photo", {
    parent: this.adminBase,
  });

  private readonly adminTagBase = new EntryPoint("/tag", {
    parent: this.adminBase,
  });

  protected readonly entryPoints: Record<BaseEntryPointsId, EntryPoint> = {
    [BaseEntryPointsId.Base]: this.base,
    [BaseEntryPointsId.PhotoData]: this.photoData,
    [BaseEntryPointsId.TagBase]: this.tagBase,
    [BaseEntryPointsId.AdminBase]: this.adminBase,
    [BaseEntryPointsId.AdminPhotoData]: this.adminPhotoData,
    [BaseEntryPointsId.AdminTagBase]: this.adminTagBase,
  };
}
