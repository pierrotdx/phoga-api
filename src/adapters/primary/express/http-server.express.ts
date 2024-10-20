import bodyParser from "body-parser";
import express, {
  type Express,
  type NextFunction,
  type Request,
  Response,
} from "express";
import helmet from "helmet";
import { Server } from "http";

import { LoggerWinston } from "@adapters/loggers";
import { IUseCases } from "@business-logic";
import { AppHttpServer, IParser, IParsers, IValidators } from "@http-server";
import { Logger } from "@logger";

import {
  AdminPhotoController,
  AdminPhotoRouter,
  AdminRouter,
  AppRouter,
  IAuthHandler,
  IExpressLogger,
  PhotoController,
  PhotoRouter,
} from ".";
import { ExpressLoggerWinston } from "./loggers";

export class ExpressHttpServer implements AppHttpServer {
  public readonly app: Express = express();
  private server: Server;
  private loggerHandler: IExpressLogger["handler"];

  constructor(
    private readonly useCases: IUseCases,
    private readonly validators: IValidators,
    private readonly parsers: IParsers,
    private readonly logger: Logger,
    private readonly authHandler: IAuthHandler,
  ) {
    this.setLoggerHandler();
    this.initExpressApp();
  }

  private initExpressApp() {
    this.app.use(helmet());
    this.app.use(bodyParser.json());
    this.initExpressLogger();
    this.initRouter();
    this.app.use(this.logError.bind(this));
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
    const photoRouter = this.getPhotoRouter();
    const adminRouter = this.getAdminRouter();
    const router = new AppRouter(
      photoRouter,
      adminRouter,
      this.authHandler,
    ).getRouter();
    this.app.use(router);
  }

  private getPhotoRouter(): PhotoRouter {
    const photoController = new PhotoController(
      this.useCases,
      this.validators,
      this.parsers,
    );
    return new PhotoRouter(photoController);
  }

  private getAdminRouter(): AdminRouter {
    const adminPhotoRouter = this.getAdminPhotoRouter();
    return new AdminRouter(adminPhotoRouter, this.authHandler);
  }

  private getAdminPhotoRouter(): AdminPhotoRouter {
    const adminPhotoController = new AdminPhotoController(
      this.useCases,
      this.validators,
      this.parsers,
    );
    return new AdminPhotoRouter(adminPhotoController, this.authHandler);
  }

  private logError(err: any, req: Request, res: Response, next: NextFunction) {
    this.logger.error(err);
    next(err);
  }

  listen(port = 3000) {
    this.server = this.app.listen(port, () => this.onAppListening(port));
  }

  private onAppListening(port: number) {
    this.logger.info(`express server listening on port: ${port}`);
  }

  async close() {
    this.server.close();
    await this.serverClosed();
  }

  private serverClosed = () => {
    return new Promise<void>((resolve, reject) => {
      this.server.on("close", (err: Error) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  };
}
