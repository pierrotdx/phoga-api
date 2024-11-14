import { IPhotoImageDb, IPhotoMetadataDb, UseCasesFactory } from "@domain";
import {
  AjvValidatorsFactory,
  AppHttpServer,
  ExpressAuthHandler,
  ParsersFactory,
} from "@http-server";
import { ILogger } from "@logger";
import { Factory } from "@shared";

import { ExpressHttpServer } from "./app-http-server.express";

export class ExpressAppHttpServerFactory implements Factory<AppHttpServer> {
  private readonly logger: ILogger;
  private readonly photoImageDb: IPhotoImageDb;
  private readonly photoMetadataDb: IPhotoMetadataDb;

  constructor({
    logger,
    photoImageDb,
    photoMetadataDb,
  }: {
    logger: ILogger;
    photoImageDb: IPhotoImageDb;
    photoMetadataDb: IPhotoMetadataDb;
  }) {
    this.logger = logger;
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
    const authHandler = this.getAuthHandler();
    return new ExpressHttpServer(
      useCases,
      validators,
      parsers,
      this.logger,
      authHandler,
    );
  }

  private getAuthHandler(): ExpressAuthHandler {
    const issuerBaseUrl = process.env.OAUTH2_ISSUER_BASE_URL;
    const audience = process.env.OAUTH2_AUDIENCE;
    return new ExpressAuthHandler(issuerBaseUrl, audience);
  }
}
