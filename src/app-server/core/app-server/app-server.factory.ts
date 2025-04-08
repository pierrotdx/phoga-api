import { ExpressAuthHandler } from "#auth-context";
import { ILogger } from "#logger-context";
import { IPhotoImageDb, IPhotoMetadataDb } from "#photo-context";
import { Factory } from "#shared/models";

import { IAppServer } from "../models";
import { ExpressHttpServer } from "./app-server";

export class AppServerFactory implements Factory<IAppServer> {
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

  create(): IAppServer {
    const authHandler = this.getAuthHandler();
    return new ExpressHttpServer(
      this.photoMetadataDb,
      this.photoImageDb,
      this.logger,
      authHandler,
    );
  }

  private getAuthHandler(): ExpressAuthHandler {
    const domain = process.env.OAUTH2_AUTHORIZATION_SERVER_DOMAIN;
    const issuerBaseURL = `https://${domain}`;
    const audience = process.env.OAUTH2_AUDIENCE;
    return new ExpressAuthHandler(issuerBaseURL, audience);
  }
}
