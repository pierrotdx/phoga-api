import path from "path";

import { IEntryPoint } from "@http-server/models";

export class EntryPoint implements IEntryPoint {

    constructor(
        private readonly relativePath: string,
        public readonly orderedParents?: IEntryPoint[],
    ) {}

    getRelativePath() {
        return this.relativePath;
    };

    getFullPath() {
        if (!this.orderedParents?.length) {
            return this.getRelativePath();
        }
        const orderedParentsPaths = this.orderedParents.reduce(
            (pathsAcc: string[], entryPoint: IEntryPoint) => {
                pathsAcc.push(entryPoint.getRelativePath());
                return pathsAcc;
            }, []);
        const allFragments = [...orderedParentsPaths, this.getRelativePath()];
        return path.join(...allFragments).replace(/\\/g, "/");
    }
}