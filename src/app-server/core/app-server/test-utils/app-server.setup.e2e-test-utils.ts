import { Auth0TokenProvider, ExpressAuthHandler } from "#auth-context";
import { ILogger, LoggerWinston } from "#logger-context";
import {
  IPhotoImageDb,
  IPhotoMetadataDb,
  PhotoImageDbGcs,
  PhotoMetadataDbMongo,
} from "#photo-context";
import { IMongoCollections, MongoManager } from "#shared/mongo";

import { Storage } from "@google-cloud/storage";

import { ExpressHttpServer } from "../app-server";

export interface IAppServerE2ETestParams {
  mongo: { url: string; dbName: string; collections: IMongoCollections };
  gc: { keyFile: string; photoImageBucket: string };
  tokenProvider: {
    domain: string;
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;
    audience: string;
  };
}

export class AppServerSetupE2ETestUtils {
  private readonly mongoManager: MongoManager;
  private readonly storage: Storage;
  protected readonly tokenProvider: Auth0TokenProvider;
  private readonly authHandler: ExpressAuthHandler;
  private logger: ILogger;

  protected readonly username: string;
  protected readonly password: string;
  protected readonly audience: string;

  private readonly photoImageBucket: string;

  protected photoMetadataDb: IPhotoMetadataDb;
  protected photoImageDbGcs: IPhotoImageDb;

  private appServer: ExpressHttpServer;

  constructor({ mongo, gc, tokenProvider }: IAppServerE2ETestParams) {
    this.mongoManager = new MongoManager(
      mongo.url,
      mongo.dbName,
      mongo.collections,
    );
    this.storage = new Storage(gc);
    this.tokenProvider = new Auth0TokenProvider(tokenProvider);
    const issuerBaseURL = `https://${tokenProvider.domain}`;
    this.authHandler = new ExpressAuthHandler(
      issuerBaseURL,
      tokenProvider.audience,
    );
    this.username = tokenProvider.username;
    this.password = tokenProvider.password;
    this.audience = tokenProvider.audience;
    this.photoImageBucket = gc.photoImageBucket;
  }

  protected async setupDbs(): Promise<void> {
    await this.openMongoConnection();
    this.photoMetadataDb = new PhotoMetadataDbMongo(this.mongoManager);
    this.photoImageDbGcs = new PhotoImageDbGcs(
      this.storage,
      this.photoImageBucket,
    );
    this.onDbsSetup();
  }

  private async openMongoConnection(): Promise<void> {
    await this.mongoManager.open();
  }

  private onDbsSetup(): void {
    this.setupServer();
  }

  private setupServer(): void {
    const silentLogger = true;
    this.logger = new LoggerWinston(silentLogger);

    this.appServer = new ExpressHttpServer(
      this.photoMetadataDb,
      this.photoImageDbGcs,
      this.logger,
      this.authHandler,
    );
    this.appServer.listen();
  }

  protected async closeAppServer(): Promise<void> {
    await this.appServer.close();
  }

  protected async closeMongoConnection(): Promise<void> {
    await this.mongoManager.close();
  }

  getServer(): ExpressHttpServer {
    return this.appServer;
  }

  getLogger(): ILogger {
    return this.logger;
  }
}
