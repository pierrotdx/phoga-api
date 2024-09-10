import { Permission } from "../permission";
import { EntryPointId, IEntryPoint } from "./";

export interface IEntryPoints {
  get(id: EntryPointId): IEntryPoint;
  getRelativePath(id: EntryPointId): string;
  getFullPath(id: EntryPointId): string;
  getPermissions(id: EntryPointId): Permission[];
}
