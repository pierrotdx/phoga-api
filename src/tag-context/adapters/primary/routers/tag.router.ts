import { IEntryPoints } from "#shared/entry-points";
import { Router } from "express";

import {
  GetTagController,
  ITagDb,
  ITagRouter,
  SearchTagController,
  TagEntryPointId,
  TagEntryPoints,
} from "../../../core";

export class TagRouter implements ITagRouter {
  private readonly router = Router();
  private readonly tagEntryPoints: IEntryPoints<TagEntryPointId> =
    new TagEntryPoints();

  constructor(private readonly tagDb: ITagDb) {
    this.setSearchTagRoute();
    this.setGetTagRoute();
  }

  private setGetTagRoute(): void {
    const controller = new GetTagController(this.tagDb);
    const path = this.getPath(TagEntryPointId.GetTag);
    this.router.get(path, controller.handler);
  }

  private setSearchTagRoute(): void {
    const controller = new SearchTagController(this.tagDb);
    const path = this.getPath(TagEntryPointId.SearchTag);
    this.router.get(path, controller.handler);
  }

  private getPath(tagEntryPointId: TagEntryPointId): string {
    return this.tagEntryPoints.getRelativePath(tagEntryPointId);
  }

  get(): Router {
    return this.router;
  }
}
