export interface IEntryPoint {
    orderedParents?: IEntryPoint[];
    getRelativePath: () => string;
}