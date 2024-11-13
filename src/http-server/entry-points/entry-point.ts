import path from "path";

import { IEntryPoint, IEntryPointOptions } from "../models";
import { Scope } from "../scope";

export class EntryPoint implements IEntryPoint {
  private readonly parent: IEntryPoint;
  private readonly scopes: Scope[];

  constructor(
    private readonly relativePath: string,
    options?: IEntryPointOptions,
  ) {
    if (options?.parent) {
      this.parent = options.parent;
    }
    if (options?.scopes) {
      this.scopes = options.scopes;
    }
  }

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

  getFullPathRaw() {
    if (!this.parent) {
      return this.getRelativePath();
    }
    const allPathFragments = [
      this.parent.getFullPathRaw(),
      this.getRelativePath(),
    ];
    return path.join(...allPathFragments).replace(/\\/g, "/");
  }

  getFullPathWithParams(params: any) {
    const rawPath = this.getFullPathRaw();
    return this.getPathWithParams(rawPath, params);
  }

  private getPathWithParams(rawPath: string, params: any): string {
    let pathWithParams = rawPath;
    Object.entries(params).forEach(([key, value]) => {
      const pathParam = `:${key}`;
      const isInRawPath = rawPath.includes(pathParam);
      if (isInRawPath && typeof value === "string") {
        pathWithParams = pathWithParams.replace(pathParam, value);
      }
    });
    return pathWithParams;
  }
}
