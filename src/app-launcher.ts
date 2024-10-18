import dotenv from "dotenv";

import {
  AddPhotoAjvValidator,
  DeletePhotoAjvValidator,
  ExpressHttpServer,
  GetPhotoAjvValidator,
  MongoBase,
  PhotoImageDbGcs,
  PhotoMetadataDbMongo,
  SearchPhotoAjvValidator,
  gcsTestUtils,
} from "@adapters";
import { LoggerWinston } from "@adapters/loggers";
import {
  AddPhoto,
  DeletePhoto,
  GetPhoto,
  IPhotoImageDb,
  IPhotoMetadataDb,
  IUseCases,
  ReplacePhoto,
  SearchPhoto,
} from "@business-logic";
import { IValidators } from "@http-server";

import { ExpressAuthHandler } from "./adapters/primary/oauth2-jwt-bearer";

dotenv.config();

export class AppLauncher {
  private metadataDb: IPhotoMetadataDb;
  private imageDb: IPhotoImageDb;

  private useCases: IUseCases;
  private validators: IValidators;

  private logger = new LoggerWinston();
  private authHandler: ExpressAuthHandler;

  async start() {
    await this.startPhotoMetadataDb();
    await this.startPhotoImageDb();
    this.setUseCases();
    this.setValidators();
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

  private setUseCases() {
    this.useCases = {
      getPhoto: new GetPhoto(this.metadataDb, this.imageDb),
      addPhoto: new AddPhoto(this.metadataDb, this.imageDb),
      replacePhoto: new ReplacePhoto(this.metadataDb, this.imageDb),
      deletePhoto: new DeletePhoto(this.metadataDb, this.imageDb),
      searchPhoto: new SearchPhoto(this.metadataDb, this.imageDb),
    };
  }

  private setValidators() {
    this.validators = {
      getPhoto: new GetPhotoAjvValidator(),
      addPhoto: new AddPhotoAjvValidator(),
      replacePhoto: new AddPhotoAjvValidator(),
      deletePhoto: new DeletePhotoAjvValidator(),
      searchPhoto: new SearchPhotoAjvValidator(),
    };
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
      this.logger,
      this.authHandler,
    );
    expressHttpServer.listen();
  }
}
