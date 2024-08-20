import express, { Express } from "express";
import { AppRouter } from "./routers/app.router";
import bodyParser from "body-parser";
import helmet from "helmet";

export class ExpressApp {
  app: Express = express();

  constructor(private readonly appRouter: AppRouter) {
    this.app.use(helmet());
    this.app.use(bodyParser.json());
    this.setRouter();
  }

  private setRouter() {
    this.app.use(this.appRouter.router);
  }

  listen(port = 3000) {
    this.app.listen(port, () => this.onAppListening(port));
  }

  private onAppListening(port: number) {
    console.log(`express server listening on port: ${port}`);
  }
}
