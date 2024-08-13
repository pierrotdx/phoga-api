import express, { Express } from "express";
import { Server } from "http";
import { AppRouter } from "./routers/app.router";

export class ExpressApp {
  app: Express = express();
  private server: Server | undefined;

  constructor(
    private readonly port: number = 3000,
    private readonly appRouter: AppRouter,
  ) {
    this.setRouter();
  }

  private setRouter() {
    this.app.use(this.appRouter.router);
  }

  start() {
    this.server = this.app.listen(this.port, this.onAppListening);
  }

  private onAppListening() {
    console.log(`express server listening on port: ${this.port}`);
  }

  close() {
    this.server?.close();
  }
}
