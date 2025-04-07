import { Permission } from "@shared/models";

export interface IEntryPoint {
  getFullPathRaw(): string;
  getFullPathWithParams(params: any): string;
  getRelativePath(): string;
  getPermissions(): Permission[];
  getParent(): IEntryPoint;
}

export interface IEntryPointOptions {
  parent?: IEntryPoint;
  permissions?: Permission[];
}
