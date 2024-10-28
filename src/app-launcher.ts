import dotenv from "dotenv";

import {
  ExpressAppHttpServerFactory,
  MongoBase,
  PhotoImageDbGcs,
  PhotoMetadataDbMongo,
  gcsTestUtils,
} from "@adapters";
import { IPhotoImageDb, IPhotoMetadataDb } from "@business-logic";
import { AppHttpServer } from "@http-server";

dotenv.config();

export class AppLauncher {
  private photoMetadataDb: IPhotoMetadataDb;
  private photoImageDb: IPhotoImageDb;
  private httpServer: AppHttpServer;
  private readonly defaultPort: number = 3000;

  async start() {
    await this.setupDbs();
    this.httpServer = new ExpressAppHttpServerFactory({
      photoMetadataDb: this.photoMetadataDb,
      photoImageDb: this.photoImageDb,
    }).create();
    this.httpServer.listen(this.defaultPort);
  }

  private async setupDbs(): Promise<void> {
    await this.setPhotoMetadataDb();
    await this.setPhotoImageDb();
  }

  private async setPhotoMetadataDb() {
    const mongoBase = new MongoBase(
      process.env.MONGO_URL,
      process.env.MONGO_DB,
    );
    await mongoBase.open();
    this.photoMetadataDb = new PhotoMetadataDbMongo(mongoBase);
  }

  private async setPhotoImageDb() {
    const storage = await gcsTestUtils.getStorage();
    this.photoImageDb = new PhotoImageDbGcs(storage);
  }
}
