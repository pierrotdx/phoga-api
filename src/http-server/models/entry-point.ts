import { Scope } from "../scope";

export interface IEntryPoint {
  getFullPath(): string;
  getRelativePath(): string;
  getScopes(): Scope[];
  getParent(): IEntryPoint;
}
