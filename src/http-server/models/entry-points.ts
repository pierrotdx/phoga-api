import { EntryPointId } from "./";

export interface IEntryPoints {
    getRelativePath(id: EntryPointId): string;
    getFullPath(id: EntryPointId): string;
}