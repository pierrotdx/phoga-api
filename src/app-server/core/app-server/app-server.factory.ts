import { ExpressAuthHandler } from "#auth-context";
import { ILogger } from "#logger-context";
import { IPhotoDataDb, IPhotoImageDb } from "#photo-context";
import { Factory } from "#shared/models";
import { ITagDb } from "#tag-context";

import { IAppServer } from "../models";
import { ExpressAppServer } from "./app-server";

export class AppServerFactory implements Factory<IAppServer> {
  private readonly logger: ILogger;
  private readonly photoImageDb: IPhotoImageDb;
  private readonly photoDataDb: IPhotoDataDb;
  private readonly tagDb: ITagDb;

  constructor({
    logger,
    photoImageDb,
    photoDataDb,
    tagDb,
  }: {
    logger: ILogger;
    photoImageDb: IPhotoImageDb;
    photoDataDb: IPhotoDataDb;
    tagDb: ITagDb;
  }) {
    this.logger = logger;
    this.photoImageDb = photoImageDb;
    this.photoDataDb = photoDataDb;
    this.tagDb = tagDb;
  }

  create(): IAppServer {
    const authHandler = this.getAuthHandler();
    return new ExpressAppServer(
      this.photoDataDb,
      this.photoImageDb,
      this.tagDb,
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
