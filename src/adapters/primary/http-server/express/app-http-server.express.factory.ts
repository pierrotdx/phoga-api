import { LoggerWinston } from "@adapters";
import { AjvValidatorsFactory } from "@adapters/validators";
import {
  IPhotoImageDb,
  IPhotoMetadataDb,
  UseCasesFactory,
} from "@business-logic";
import { AppHttpServer } from "@http-server";
import { Factory } from "@utils";

import { ExpressAuthHandler } from "../../oauth2-jwt-bearer";
import { ParsersFactory } from "../../parsers";
import { ExpressHttpServer } from "./app-http-server.express";

export class ExpressAppHttpServerFactory implements Factory<AppHttpServer> {
  private readonly photoImageDb: IPhotoImageDb;
  private readonly photoMetadataDb: IPhotoMetadataDb;

  constructor({
    photoImageDb,
    photoMetadataDb,
  }: {
    photoImageDb: IPhotoImageDb;
    photoMetadataDb: IPhotoMetadataDb;
  }) {
    this.photoImageDb = photoImageDb;
    this.photoMetadataDb = photoMetadataDb;
  }

  create(): AppHttpServer {
    const useCases = new UseCasesFactory(
      this.photoMetadataDb,
      this.photoImageDb,
    ).create();
    const validators = new AjvValidatorsFactory().create();
    const parsers = new ParsersFactory().create();
    const logger = new LoggerWinston();
    const authHandler = this.getAuthHandler();
    return new ExpressHttpServer(
      useCases,
      validators,
      parsers,
      logger,
      authHandler,
    );
  }

  private getAuthHandler(): ExpressAuthHandler {
    const issuerBaseUrl = process.env.OAUTH2_ISSUER_BASE_URL;
    const audience = process.env.OAUTH2_AUDIENCE;
    return new ExpressAuthHandler(issuerBaseUrl, audience);
  }
}
