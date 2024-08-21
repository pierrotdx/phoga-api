import { IUseCases } from "../../../../../business-logic";
import { IValidators } from "../../models";
import { AppRouter, ExpressApp, PhotoController, PhotoRouter } from "../app";

export class ExpressAppFacade {
  private readonly appRouter: AppRouter;

  constructor(
    private readonly useCases: IUseCases,
    private readonly validators: IValidators,
  ) {
    const photoController = new PhotoController(this.useCases, this.validators);
    const photoRouter = new PhotoRouter(photoController);
    this.appRouter = new AppRouter(photoRouter);
  }

  generate() {
    return new ExpressApp(this.appRouter);
  }
}
