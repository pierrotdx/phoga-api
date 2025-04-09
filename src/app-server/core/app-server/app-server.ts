import { IAuthHandler } from "#auth-context";
import { ILogger, LoggerWinston } from "#logger-context";
import { IPhotoImageDb, IPhotoMetadataDb } from "#photo-context";
import { IExpressLogger } from "#shared/express";
import { ITagDb } from "#tag-context";
import bodyParser from "body-parser";
import cors from "cors";
import express, {
  type Express,
  type NextFunction,
  type Request,
  Response,
} from "express";
import helmet from "helmet";
import { Server } from "http";

import { ExpressLoggerWinston } from "../loggers";
import { IAppServer } from "../models/";
import { AppRouter } from "../routers/app.router";

export class ExpressAppServer implements IAppServer {
  public readonly app: Express = express();
  private server: Server;
  private loggerHandler: IExpressLogger["handler"];

  constructor(
    private readonly metadataDb: IPhotoMetadataDb,
    private readonly imageDb: IPhotoImageDb,
    private readonly tagDb: ITagDb,
    private readonly logger: ILogger,
    private readonly authHandler: IAuthHandler,
  ) {
    this.setLoggerHandler();
    this.initExpress();
  }

  private initExpress() {
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(bodyParser.json());
    this.initLogger();
    this.initRouter();
    this.app.use(this.logError.bind(this));
  }

  private initLogger() {
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
    const router = new AppRouter(
      this.authHandler,
      this.metadataDb,
      this.imageDb,
      this.tagDb,
    ).get();
    this.app.use(router);
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
