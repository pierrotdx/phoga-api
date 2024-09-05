import { Permission } from "../permission";

export interface IEntryPoint {
    getFullPath(): string;
    getRelativePath(): string;
    getPermissions(): Permission[];
}