import { EntryPointId } from "./";
import { Permission } from "../permission";

export interface IEntryPoints {
    getRelativePath(id: EntryPointId): string;
    getFullPath(id: EntryPointId): string;
    getPermissions(id: EntryPointId): Permission[];
}