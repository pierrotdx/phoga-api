import dotenv from "dotenv";

import {
  AddPhotoAjvValidator,
  DeletePhotoAjvValidator,
  ExpressHttpServer,
  GetPhotoAjvValidator,
  MongoBase,
  PhotoImageDbGcs,
  PhotoMetadataDbMongo,
  getTestStorage,
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
} from "@business-logic";
import { IValidators } from "@http-server";

dotenv.config();

export class AppLauncher {
  private metadataDb: IPhotoMetadataDb;
  private imageDb: IPhotoImageDb;
  private logger = new LoggerWinston();

  private useCases: IUseCases;
  private validators: IValidators;

  async start() {
    await this.startPhotoMetadataDb();
    await this.startPhotoImageDb();
    this.setUseCases();
    this.setValidators();
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
    const storage = await getTestStorage();
    this.imageDb = new PhotoImageDbGcs(storage);
  }

  private setUseCases() {
    this.useCases = {
      getPhoto: new GetPhoto(this.metadataDb, this.imageDb),
      addPhoto: new AddPhoto(this.metadataDb, this.imageDb),
      replacePhoto: new ReplacePhoto(this.metadataDb, this.imageDb),
      deletePhoto: new DeletePhoto(this.metadataDb, this.imageDb),
    };
  }

  private setValidators() {
    this.validators = {
      getPhoto: new GetPhotoAjvValidator(),
      addPhoto: new AddPhotoAjvValidator(),
      replacePhoto: new AddPhotoAjvValidator(),
      deletePhoto: new DeletePhotoAjvValidator(),
    };
  }

  private startHttpServer() {
    const expressHttpServer = new ExpressHttpServer(
      this.useCases,
      this.validators,
      this.logger,
    );
    expressHttpServer.listen();
  }
}
