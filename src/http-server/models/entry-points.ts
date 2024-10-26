import { Scope } from "../scope";
import { EntryPointId, IEntryPoint } from "./";

export interface IEntryPoints {
  get(id: EntryPointId): IEntryPoint;
  getRelativePath(id: EntryPointId): string;
  getFullPathRaw(id: EntryPointId): string;
  getFullPathWithParams<T>(id: EntryPointId, params: T): string;
  getScopes(id: EntryPointId): Scope[];
}
