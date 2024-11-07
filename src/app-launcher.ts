import dotenv from "dotenv";

import {
  ExpressAppHttpServerFactory,
  MongoManager,
  PhotoImageDbGcs,
  PhotoMetadataDbMongo,
} from "@adapters";
import { IPhotoImageDb, IPhotoMetadataDb } from "@business-logic";
import { Storage } from "@google-cloud/storage";
import { AppHttpServer } from "@http-server";
import { ILogger } from "@logger/models";

dotenv.config();

export class AppLauncher {
  constructor(private readonly logger: ILogger) {}

  private photoMetadataDb: IPhotoMetadataDb;
  private photoImageDb: IPhotoImageDb;
  private httpServer: AppHttpServer;
  private readonly defaultPort: number = 3000;

  async start() {
    this.logger.info("starting PHOGA application");
    await this.setupDbs();
    this.httpServer = new ExpressAppHttpServerFactory({
      logger: this.logger,
      photoMetadataDb: this.photoMetadataDb,
      photoImageDb: this.photoImageDb,
    }).create();
    this.httpServer.listen(this.defaultPort);
  }

  private async setupDbs(): Promise<void> {
    this.logger.info("initiating dbs set up");
    await this.setPhotoMetadataDb();
    await this.setPhotoImageDb();
    this.logger.info("successfully connected to dbs");
  }

  private async setPhotoMetadataDb() {
    const mongoManager = new MongoManager(
      process.env.MONGO_URL,
      process.env.MONGO_DB,
    );
    await mongoManager.open();
    this.photoMetadataDb = new PhotoMetadataDbMongo(mongoManager);
  }

  private async setPhotoImageDb() {
    const storage = new Storage();
    this.photoImageDb = new PhotoImageDbGcs(storage);
  }
}
