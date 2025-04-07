import { Permission } from "#shared/models";

import { IEntryPoint } from "./entry-point";

export interface IEntryPoints<T> {
  get(id: T): IEntryPoint;
  getRelativePath(id: T): string;
  getFullPathRaw(id: T): string;
  getFullPathWithParams<TParams>(id: T, params: TParams): string;
  getPermissions(id: T): Permission[];
}
