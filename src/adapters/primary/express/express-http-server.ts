import bodyParser from "body-parser";
import express, {
  type Express,
  Handler,
  type NextFunction,
  type Request,
  Response,
} from "express";
import helmet from "helmet";
import { Server } from "http";

import { LoggerWinston } from "@adapters/loggers";
import { IUseCases } from "@business-logic";
import { HttpError, IValidators, AppHttpServer } from "@http-server";
import { Logger } from "@logger";

import { AppRouter, PhotoController, PhotoRouter } from ".";
import { ExpressLoggerWinston } from "./loggers";

export class ExpressHttpServer implements AppHttpServer {
  public readonly app: Express = express();
  private server: Server;
  private loggerHandler: Handler;

  constructor(
    private readonly useCases: IUseCases,
    private readonly validators: IValidators,
    private readonly logger: Logger,
  ) {
    this.setLoggerHandler();
    this.initExpressApp();
  }

  private initExpressApp() {
    this.app.use(helmet());
    this.app.use(bodyParser.json());
    this.initExpressLogger();
    this.initRouter();
    this.app.use(this.errorHandler.bind(this));
  }

  private initExpressLogger() {
    if (this.loggerHandler) {
      this.app.use(this.loggerHandler);
    }
  }

  private setLoggerHandler(): void {
    if (this.logger && this.logger instanceof LoggerWinston) {
      const expressLogger = new ExpressLoggerWinston(this.logger.transports);
      this.loggerHandler = expressLogger.handler;
      return;
    }
    this.logger.warn(
      "express handler not implemented for this instance of logger",
    );
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
    this.logger.error(err);
    res.status(500).json(HttpError.Default);
  }

  listen(port = 3000) {
    this.server = this.app.listen(port, () => this.onAppListening(port));
  }

  private onAppListening(port: number) {
    this.logger.info(`express server listening on port: ${port}`);
  }

  close() {
    this.server?.close();
  }
}
