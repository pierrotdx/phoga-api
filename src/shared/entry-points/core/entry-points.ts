import { Permission } from "#shared/models";

import { IEntryPoint, IEntryPoints } from "./models";

export abstract class EntryPoints<T extends string> implements IEntryPoints<T> {
  protected abstract entryPoints: Record<T, IEntryPoint>;

  get(id: T) {
    return this.entryPoints[id];
  }

  getRelativePath(id: T): string {
    return this.entryPoints[id].getRelativePath();
  }

  getFullPathRaw(id: T): string {
    return this.entryPoints[id].getFullPathRaw();
  }

  getFullPathWithParams(id: T, params: any): string {
    return this.entryPoints[id].getFullPathWithParams(params);
  }

  getPermissions(id: T): Permission[] {
    return this.entryPoints[id].getPermissions();
  }
}
