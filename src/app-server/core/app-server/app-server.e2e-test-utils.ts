import { Auth0TokenProvider, ExpressAuthHandler } from "#auth-context";
import { ILogger, LoggerWinston } from "#logger-context";
import {
  ExpressPhotoTestUtils,
  IPhoto,
  IPhotoImageDb,
  IPhotoMetadataDb,
  PhotoImageDbGcs,
  PhotoMetadataDbMongo,
  PhotoTestUtils,
} from "#photo-context";
import { SortDirection } from "#shared/models";
import { IMongoCollections, MongoManager } from "#shared/mongo";
import { Response, Test } from "supertest";

import { Storage } from "@google-cloud/storage";

import { ExpressHttpServer } from "./app-server";

export class AppServerTestUtils {
  private readonly mongoManager: MongoManager;
  private readonly storage: Storage;
  private readonly tokenProvider: Auth0TokenProvider;
  private readonly authHandler: ExpressAuthHandler;
  private logger: ILogger;

  private readonly username: string;
  private readonly password: string;
  private readonly audience: string;

  private readonly photoImageBucket: string;

  private photoMetadataDb: IPhotoMetadataDb;
  private photoImageDbGcs: IPhotoImageDb;

  private expressSharedTestUtils: ExpressPhotoTestUtils;
  private photoTestUtils: PhotoTestUtils;

  private expressHttpServer: ExpressHttpServer;

  constructor({
    mongo,
    gc,
    tokenProvider,
  }: {
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
  }) {
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

  async internalSetup(): Promise<void> {
    await this.mongoManager.open();
    this.setupDbs();
    this.testUtilsFactory();
    this.setupServer();
  }

  private setupDbs(): void {
    this.photoMetadataDb = new PhotoMetadataDbMongo(this.mongoManager);
    this.photoImageDbGcs = new PhotoImageDbGcs(
      this.storage,
      this.photoImageBucket,
    );
  }

  private testUtilsFactory() {
    this.photoTestUtils = new PhotoTestUtils(
      this.photoMetadataDb,
      this.photoImageDbGcs,
    );

    this.expressSharedTestUtils = new ExpressPhotoTestUtils();
  }

  private setupServer(): void {
    const silentLogger = true;
    this.logger = new LoggerWinston(silentLogger);

    this.expressHttpServer = new ExpressHttpServer(
      this.photoMetadataDb,
      this.photoImageDbGcs,
      this.logger,
      this.authHandler,
    );
    this.expressHttpServer.listen();
  }

  async internalTeardown(): Promise<void> {
    await this.expressHttpServer.close();
  }

  async globalInternalTeardown(): Promise<void> {
    await this.mongoManager.close();
  }

  getServer(): ExpressHttpServer {
    return this.expressHttpServer;
  }

  getLogger(): ILogger {
    return this.logger;
  }

  async getToken(): Promise<string> {
    return await this.tokenProvider.getToken({
      username: this.username,
      password: this.password,
      audience: this.audience,
    });
  }

  async deletePhotoFromDb(id: IPhoto["_id"]): Promise<void> {
    await this.photoTestUtils.deletePhotoFromDb(id);
  }

  async insertPhotoInDbs(photo: IPhoto): Promise<void> {
    await this.photoTestUtils.insertPhotoInDb(photo);
  }

  async getPhotoFromDb(id: IPhoto["_id"]): Promise<IPhoto> {
    return await this.photoTestUtils.getPhotoFromDb(id);
  }

  getPayloadFromPhoto(photo: IPhoto) {
    return this.expressSharedTestUtils.getPayloadFromPhoto(photo);
  }

  addFormDataToReq(req: Test, photo: IPhoto): void {
    this.expressSharedTestUtils.addFormDataToReq(req, photo);
  }

  getPhotoFromResponse(res: Response): IPhoto {
    return this.expressSharedTestUtils.getPhotoFromResponse(res);
  }

  async expectPhotoToBeUploaded(photo: IPhoto): Promise<void> {
    await this.photoTestUtils.expectPhotoToBeUploaded(photo);
  }

  expectMatchingPhotos(expectedPhoto: IPhoto, result: IPhoto): void {
    this.photoTestUtils.expectMatchingPhotos(expectedPhoto, result);
    this.photoTestUtils.checkAssertions();
  }

  expectSearchResultMatchingSize(searchResult: any[], size: number): void {
    return this.photoTestUtils.expectPhotosArraySizeToBe(searchResult, size);
  }

  expectSearchResultMatchingDateOrdering(
    searchResult: any[],
    dateOrdering: SortDirection,
  ): void {
    return this.photoTestUtils.expectPhotosOrderToBe(
      searchResult,
      dateOrdering,
    );
  }

  async expectPhotoToBeReplacedInDb(
    dbPhotoBefore: IPhoto,
    expectedPhoto: IPhoto,
  ): Promise<void> {
    await this.photoTestUtils.expectPhotoToBeReplacedInDb(
      dbPhotoBefore,
      expectedPhoto,
    );
  }

  async expectPhotoToBeDeletedFromDbs(id: IPhoto["_id"]): Promise<void> {
    await this.photoTestUtils.expectPhotoToBeDeletedFromDbs(id);
  }
}
