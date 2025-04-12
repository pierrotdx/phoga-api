import { ILogger } from "#logger-context";
import {
  IPhotoBaseDb,
  IPhotoImageDb,
  PhotoBaseDbMongo,
  PhotoImageDbGcs,
} from "#photo-context";
import { MongoManager } from "#shared/mongo";
import { ITagDb, TagDbMongo } from "#tag-context";
import dotenv from "dotenv";

import { Storage } from "@google-cloud/storage";

import { IAppServer } from "./app-server";
import { AppServerFactory } from "./app-server/core/app-server";

dotenv.config();

export class AppLauncher {
  constructor(private readonly logger: ILogger) {}

  private photoBaseDb: IPhotoBaseDb;
  private photoImageDb: IPhotoImageDb;
  private tagDb: ITagDb;
  private httpServer: IAppServer;
  private readonly defaultPort: number = 3000;

  private mongoManager: MongoManager;

  async start() {
    this.logger.info("starting PHOGA application");
    await this.setupDbs();
    this.httpServer = new AppServerFactory({
      logger: this.logger,
      photoBaseDb: this.photoBaseDb,
      photoImageDb: this.photoImageDb,
      tagDb: this.tagDb,
    }).create();
    this.httpServer.listen(this.defaultPort);
  }

  private async setupDbs(): Promise<void> {
    this.logger.info("initiating dbs set up");
    await this.initMongo();
    this.onMongoConnection();
    await this.setPhotoImageDb();
    this.logger.info("successfully connected to dbs");
  }

  private async initMongo(): Promise<void> {
    this.mongoManager = new MongoManager(
      process.env.MONGO_URL,
      process.env.MONGO_DB,
      {
        PhotoBase: process.env.MONGO_PHOTO_BASE_COLLECTION,
        Tags: process.env.MONGO_TAG_COLLECTION,
      },
    );
    await this.mongoManager.open();
  }

  private onMongoConnection(): void {
    this.photoBaseDb = new PhotoBaseDbMongo(this.mongoManager);
    this.tagDb = new TagDbMongo(this.mongoManager);
  }

  private async setPhotoImageDb() {
    const storage = new Storage();
    this.photoImageDb = new PhotoImageDbGcs(
      storage,
      process.env.GC_PHOTO_IMAGES_BUCKET,
    );
  }
}
