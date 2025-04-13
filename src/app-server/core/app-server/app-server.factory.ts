import { ExpressAuthHandler } from "#auth-context";
import { ILogger } from "#logger-context";
import { IPhotoBaseDb, IPhotoImageDb } from "#photo-context";
import { Factory } from "#shared/models";
import { ITagDb } from "#tag-context";

import { IAppServer } from "../models";
import { ExpressAppServer } from "./app-server";

export class AppServerFactory implements Factory<IAppServer> {
  private readonly logger: ILogger;
  private readonly photoImageDb: IPhotoImageDb;
  private readonly photoBaseDb: IPhotoBaseDb;
  private readonly tagDb: ITagDb;

  constructor({
    logger,
    photoImageDb,
    photoBaseDb,
    tagDb,
  }: {
    logger: ILogger;
    photoImageDb: IPhotoImageDb;
    photoBaseDb: IPhotoBaseDb;
    tagDb: ITagDb;
  }) {
    this.logger = logger;
    this.photoImageDb = photoImageDb;
    this.photoBaseDb = photoBaseDb;
    this.tagDb = tagDb;
  }

  create(): IAppServer {
    const authHandler = this.getAuthHandler();
    return new ExpressAppServer(
      this.photoBaseDb,
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
