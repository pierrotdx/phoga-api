import path from "path";

import { IEntryPoint } from "../models";
import { Scope } from "../scope";

export class EntryPoint implements IEntryPoint {
  constructor(
    private readonly relativePath: string,
    public readonly parent?: IEntryPoint,
    public readonly scopes?: Scope[],
  ) {}

  getParent(): IEntryPoint {
    return this.parent;
  }

  getScopes(): Scope[] {
    const scopes = this.scopes || [];
    const parentScopes = this.parent?.getScopes() || [];
    const allScopes = [...scopes, ...parentScopes];
    return allScopes;
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
