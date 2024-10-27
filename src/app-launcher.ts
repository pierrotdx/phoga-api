import dotenv from "dotenv";

import {
  AjvValidatorsFactory,
  ExpressHttpServer,
  LoggerWinston,
  MongoBase,
  ParsersFactory,
  PhotoImageDbGcs,
  PhotoMetadataDbMongo,
  gcsTestUtils,
} from "@adapters";
import {
  IPhotoImageDb,
  IPhotoMetadataDb,
  IUseCases,
  UseCasesFactory,
} from "@business-logic";
import { IParsers, IValidators } from "@http-server";

import { ExpressAuthHandler } from "./adapters/primary/oauth2-jwt-bearer";

dotenv.config();

export class AppLauncher {
  private metadataDb: IPhotoMetadataDb;
  private imageDb: IPhotoImageDb;

  private useCases: IUseCases;
  private validators: IValidators;
  private parsers: IParsers;

  private logger = new LoggerWinston();
  private authHandler: ExpressAuthHandler;

  async start() {
    await this.startPhotoMetadataDb();
    await this.startPhotoImageDb();
    this.useCases = new UseCasesFactory(this.metadataDb, this.imageDb).create();
    this.validators = new AjvValidatorsFactory().create();
    this.parsers = new ParsersFactory().create();
    this.setAuthHandler();
    this.startHttpServer();
  }

  private async startPhotoMetadataDb() {
    const mongoBase = new MongoBase(
      process.env.MONGO_URL,
      process.env.MONGO_DB,
    );
    await mongoBase.open();
    this.metadataDb = new PhotoMetadataDbMongo(mongoBase);
  }

  private async startPhotoImageDb() {
    const storage = await gcsTestUtils.getStorage();
    this.imageDb = new PhotoImageDbGcs(storage);
  }

  private setAuthHandler() {
    const issuerBaseUrl = process.env.OAUTH2_ISSUER_BASE_URL;
    const audience = process.env.OAUTH2_AUDIENCE;
    this.authHandler = new ExpressAuthHandler(issuerBaseUrl, audience);
  }

  private startHttpServer() {
    const expressHttpServer = new ExpressHttpServer(
      this.useCases,
      this.validators,
      this.parsers,
      this.logger,
      this.authHandler,
    );
    expressHttpServer.listen();
  }
}
