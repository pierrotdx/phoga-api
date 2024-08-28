import bodyParser from "body-parser";
import express, {
  type Express,
  type NextFunction,
  type Request,
  Response,
} from "express";
import helmet from "helmet";
import { Server } from "http";

import { IUseCases } from "@business-logic";
import { IValidators, PhogaHttpServer } from "@http-server";

import { AppRouter, PhotoController, PhotoRouter } from ".";

export class ExpressHttpServer implements PhogaHttpServer {
  public readonly app: Express = express();
  private server: Server;

  constructor(
    private readonly useCases: IUseCases,
    private readonly validators: IValidators,
  ) {
    this.initExpressApp();
  }

  private initExpressApp() {
    this.app.use(helmet());
    this.app.use(bodyParser.json());
    this.initRouter();
    this.app.use(this.errorHandler);
  }

  private initRouter() {
    const photoController = new PhotoController(this.useCases, this.validators);
    const photoRouter = new PhotoRouter(photoController);
    const appRouter = new AppRouter(photoRouter).router;
    this.app.use(appRouter);
  }

  private errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    console.error(err);
    res.status(500).json(err);
  }

  listen(port = 3000) {
    this.server = this.app.listen(port, () => this.onAppListening(port));
  }

  private onAppListening(port: number) {
    console.log(`express server listening on port: ${port}`);
  }

  close() {
    this.server?.close();
  }
}
