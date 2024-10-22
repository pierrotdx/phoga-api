import dotenv from "dotenv";

import {
  AddPhotoParser,
  AjvValidator,
  ExpressHttpServer,
  GetPhotoParser,
  LoggerWinston,
  MongoBase,
  PhotoImageDbGcs,
  PhotoMetadataDbMongo,
  SearchPhotoParser,
  gcsTestUtils,
} from "@adapters";
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
import {
  AddPhotoSchema,
  DeletePhotoSchema,
  GetPhotoSchema,
  IParsers,
  IValidators,
  ReplacePhotoSchema,
  SearchPhotoSchema,
} from "@http-server";

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
    this.setUseCases();
    this.setValidators();
    this.setParsers();
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
      getPhoto: new AjvValidator(GetPhotoSchema),
      addPhoto: new AjvValidator(AddPhotoSchema),
      replacePhoto: new AjvValidator(ReplacePhotoSchema),
      deletePhoto: new AjvValidator(DeletePhotoSchema),
      searchPhoto: new AjvValidator(SearchPhotoSchema),
    };
  }

  private setParsers() {
    this.parsers = {
      getPhoto: new GetPhotoParser(),
      addPhoto: new AddPhotoParser(),
      replacePhoto: new AddPhotoParser(),
      deletePhoto: new GetPhotoParser(),
      searchPhoto: new SearchPhotoParser(),
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
      this.parsers,
      this.logger,
      this.authHandler,
    );
    expressHttpServer.listen();
  }
}
