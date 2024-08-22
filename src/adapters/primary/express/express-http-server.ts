import express, { type Express } from "express";
import { AppRouter, PhotoController, PhotoRouter } from ".";
import { Server } from "http";
import helmet from "helmet";
import bodyParser from "body-parser";
import { IUseCases } from "../../../business-logic";
import { IValidators, PhogaHttpServer } from "../../../http-server";

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
  }

  private initRouter() {
    const photoController = new PhotoController(this.useCases, this.validators);
    const photoRouter = new PhotoRouter(photoController);
    const appRouter = new AppRouter(photoRouter).router;
    this.app.use(appRouter);
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
