import { Scope } from "../scope";
import { EntryPointId, IEntryPoint } from "./";

export interface IEntryPoints {
  get(id: EntryPointId): IEntryPoint;
  getRelativePath(id: EntryPointId): string;
  getFullPath(id: EntryPointId): string;
  getScopes(id: EntryPointId): Scope[];
}
