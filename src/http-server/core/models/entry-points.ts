import { Permission } from "../permission";
import { EntryPointId, IEntryPoint } from "./";

export interface IEntryPoints {
  get(id: EntryPointId): IEntryPoint;
  getRelativePath(id: EntryPointId): string;
  getFullPathRaw(id: EntryPointId): string;
  getFullPathWithParams<T>(id: EntryPointId, params: T): string;
  getPermissions(id: EntryPointId): Permission[];
}
