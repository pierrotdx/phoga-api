import { Auth0TokenProvider, ExpressAuthHandler } from "#auth-context";
import { ILogger, LoggerWinston } from "#logger-context";
import {
  IPhotoImageDb,
  IPhotoMetadataDb,
  PhotoImageDbGcs,
  PhotoMetadataDbMongo,
} from "#photo-context";
import { MongoManager } from "#shared/mongo";
import { ITagDb, TagDbMongo } from "#tag-context";

import { Storage } from "@google-cloud/storage";

import { ExpressAppServer } from "../app-server";

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
  protected tagDb: ITagDb;

  private appServer: ExpressAppServer;

  constructor(testEnv: any) {
    const mongoParams = this.getMongoParams(testEnv);
    this.mongoManager = new MongoManager(
      mongoParams.url,
      mongoParams.dbName,
      mongoParams.collections,
    );

    const gcParams = this.getGoogleCloudParams(testEnv);
    this.storage = new Storage(gcParams);
    this.photoImageBucket = gcParams.photoImageBucket;

    const tokenProviderParams = this.getTokenProviderParams(testEnv);
    this.tokenProvider = new Auth0TokenProvider(tokenProviderParams);
    const issuerBaseURL = `https://${tokenProviderParams.domain}`;
    this.authHandler = new ExpressAuthHandler(
      issuerBaseURL,
      tokenProviderParams.audience,
    );
    this.username = tokenProviderParams.username;
    this.password = tokenProviderParams.password;
    this.audience = tokenProviderParams.audience;
  }

  private getMongoParams(testEnv: any) {
    return {
      url: testEnv.__MONGO_URL__,
      dbName: testEnv.__MONGO_DB_NAME__,
      collections: {
        PhotoMetadata: testEnv.__MONGO_PHOTO_METADATA_COLLECTION__,
        Tags: testEnv.__MONGO_TAG_COLLECTION__,
      },
    };
  }

  private getGoogleCloudParams(testEnv: any) {
    return {
      keyFile: testEnv.__GOOGLE_APPLICATION_CREDENTIALS__,
      photoImageBucket: testEnv.__GC_PHOTO_IMAGES_BUCKET__,
    };
  }

  private getTokenProviderParams(testEnv: any) {
    return {
      domain: testEnv.__OAUTH2_AUTHORIZATION_SERVER_DOMAIN__,
      clientId: testEnv.__OAUTH2_CLIENT_ID__,
      clientSecret: testEnv.__OAUTH2_CLIENT_SECRET__,
      username: testEnv.__OAUTH2_USER_NAME__,
      password: testEnv.__OAUTH2_USER_PASSWORD__,
      audience: testEnv.__OAUTH2_AUDIENCE__,
    };
  }

  protected async setupDbs(): Promise<void> {
    await this.openMongoConnection();
    this.photoMetadataDb = new PhotoMetadataDbMongo(this.mongoManager);
    this.photoImageDbGcs = new PhotoImageDbGcs(
      this.storage,
      this.photoImageBucket,
    );
    this.tagDb = new TagDbMongo(this.mongoManager);
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

    this.appServer = new ExpressAppServer(
      this.photoMetadataDb,
      this.photoImageDbGcs,
      this.tagDb,
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

  getServer(): ExpressAppServer {
    return this.appServer;
  }

  getLogger(): ILogger {
    return this.logger;
  }
}
