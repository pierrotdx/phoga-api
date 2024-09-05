import path from "path";

import { IEntryPoint } from "../models";
import { Permission } from "../permission";

export class EntryPoint implements IEntryPoint {

    constructor(
        private readonly relativePath: string,
        public readonly orderedParents?: IEntryPoint[],
        public readonly permissions?: Permission[],
    ) {}

    getPermissions(): Permission[] {
     return this.permissions || [];
    }

    getRelativePath() {
        return this.relativePath;
    };

    getFullPath() {
        if (!this.orderedParents?.length) {
            return this.getRelativePath();
        }
        const orderedParentsPaths = this.getOrderedParentsPaths();
        const allPathFragments = [...orderedParentsPaths, this.getRelativePath()];
        return path.join(...allPathFragments).replace(/\\/g, "/");
    }

    private getOrderedParentsPaths(): string[] {
        return this.orderedParents?.reduce(
            (pathsAcc: string[], entryPoint: IEntryPoint) => {
                pathsAcc.push(entryPoint.getRelativePath());
                return pathsAcc;
            }, []) || [];
    }
}