import { IAuthHandler } from "#auth-context";
import { IEntryPoints } from "#shared/entry-points";
import { Handler, Router } from "express";

import {
  AddTagController,
  DeleteTagController,
  IAdminTagRouter,
  ITagDb,
  ReplaceTagController,
  TagEntryPointId,
  TagEntryPoints,
} from "../../../core";

export class AdminTagRouter implements IAdminTagRouter {
  private readonly router = Router();
  private readonly tagEntryPoints: IEntryPoints<TagEntryPointId> =
    new TagEntryPoints();

  constructor(
    private readonly authHandler: IAuthHandler,
    private readonly tagDb: ITagDb,
  ) {
    this.setAddTagRoute();
    this.setReplaceTagRoute();
    this.setDeleteTagRoute();
  }

  private setAddTagRoute(): void {
    const controller = new AddTagController(this.tagDb);
    const path = this.getPath(TagEntryPointId.AddTag);
    const permissionHandler = this.getPermissionHandler(TagEntryPointId.AddTag);
    this.router.post(path, permissionHandler, controller.handler);
  }

  private setReplaceTagRoute(): void {
    const controller = new ReplaceTagController(this.tagDb);
    const path = this.getPath(TagEntryPointId.ReplaceTag);
    const permissionHandler = this.getPermissionHandler(
      TagEntryPointId.ReplaceTag,
    );
    this.router.put(path, permissionHandler, controller.handler);
  }

  private setDeleteTagRoute(): void {
    const controller = new DeleteTagController(this.tagDb);
    const path = this.getPath(TagEntryPointId.DeleteTag);
    const permissionHandler = this.getPermissionHandler(
      TagEntryPointId.DeleteTag,
    );
    this.router.delete(path, permissionHandler, controller.handler);
  }

  private getPath(tagEntryPointId: TagEntryPointId): string {
    return this.tagEntryPoints.getRelativePath(tagEntryPointId);
  }

  private getPermissionHandler(tagEntryPointId: TagEntryPointId): Handler {
    const permissions = this.tagEntryPoints.getPermissions(tagEntryPointId);
    return this.authHandler.requirePermissions(permissions);
  }

  get(): Router {
    return this.router;
  }
}
