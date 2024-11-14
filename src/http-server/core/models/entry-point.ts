import { Scope } from "../scope";

export interface IEntryPoint {
  getFullPathRaw(): string;
  getFullPathWithParams(params: any): string;
  getRelativePath(): string;
  getScopes(): Scope[];
  getParent(): IEntryPoint;
}

export interface IEntryPointOptions {
  parent?: IEntryPoint;
  scopes?: Scope[];
}
