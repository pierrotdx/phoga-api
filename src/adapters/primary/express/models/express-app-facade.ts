import { AppRouter, ExpressApp, PhotoController, PhotoRouter } from "../app";
import { IPhotoControllerParams } from "./photo-controller-params";

export class ExpressAppFacade {
  private readonly appRouter: AppRouter;

  constructor(photoControllerParams: IPhotoControllerParams) {
    const photoController = new PhotoController(photoControllerParams);
    const photoRouter = new PhotoRouter(photoController);
    this.appRouter = new AppRouter(photoRouter);
  }

  generate() {
    return new ExpressApp(this.appRouter);
  }
}
