import {
  BaseEntryPoints,
  BaseEntryPointsId,
  EntryPoint,
  EntryPoints,
  IEntryPoints,
} from "#shared/entry-points";
import { Permission } from "#shared/models";

import { TagEntryPointId } from "../../";

export class TagEntryPoints
  extends EntryPoints<TagEntryPointId>
  implements IEntryPoints<TagEntryPointId>
{
  private readonly baseEntryPoints = new BaseEntryPoints();

  private readonly tagBase = this.baseEntryPoints.get(
    BaseEntryPointsId.TagBase,
  );

  private readonly getTag = new EntryPoint("/:id", {
    parent: this.tagBase,
    permissions: [Permission.TagRead],
  });

  private readonly adminTagBase = this.baseEntryPoints.get(
    BaseEntryPointsId.AdminTagBase,
  );

  private readonly addTag = new EntryPoint("/", {
    parent: this.adminTagBase,
    permissions: [Permission.TagWrite],
  });

  private readonly replaceTag = new EntryPoint("/", {
    parent: this.adminTagBase,
    permissions: [Permission.TagWrite],
  });

  private readonly deleteTag = new EntryPoint("/:id", {
    parent: this.adminTagBase,
    permissions: [Permission.TagWrite],
  });

  protected readonly entryPoints: Record<TagEntryPointId, EntryPoint> = {
    [TagEntryPointId.GetTag]: this.getTag,
    [TagEntryPointId.AddTag]: this.addTag,
    [TagEntryPointId.ReplaceTag]: this.replaceTag,
    [TagEntryPointId.DeleteTag]: this.deleteTag,
  };
}
