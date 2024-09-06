import path from "path";

import { IEntryPoint } from "../models";
import { Permission } from "../permission";

export class EntryPoint implements IEntryPoint {
  constructor(
    private readonly relativePath: string,
    public readonly parent?: IEntryPoint,
    public readonly permissions?: Permission[],
  ) {}

  getParent(): IEntryPoint {
    return this.parent;
  }

  getPermissions(): Permission[] {
    const permissions = this.permissions || [];
    const parentPermissions = this.parent?.getPermissions() || [];
    const allPermissions = [...permissions, ...parentPermissions];
    return allPermissions;
  }

  getRelativePath() {
    return this.relativePath;
  }

  getFullPath() {
    if (!this.parent) {
      return this.getRelativePath();
    }
    const allPathFragments = [
      this.parent.getFullPath(),
      this.getRelativePath(),
    ];
    return path.join(...allPathFragments).replace(/\\/g, "/");
  }
}
