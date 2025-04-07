import { Auth0TokenProvider, ExpressAuthHandler } from "#auth-context";
import { ILogger, LoggerWinston } from "#logger-context";
import {
  AddPhotoTestUtils,
  DeletePhotoTestUtils,
  ExpressSharedTestUtils,
  GetPhotoTestUtils,
  IPhoto,
  IPhotoImageDb,
  IPhotoMetadataDb,
  PhotoImageDbGcs,
  PhotoMetadataDbMongo,
  PhotoTestUtils,
  ReplacePhotoTestUtils,
  SearchPhotoTestUtils,
} from "#photo-context";
import { IAssertionsCounter } from "#shared/assertions-counter";
import { SortDirection } from "#shared/models";
import { IMongoCollections, MongoManager } from "#shared/mongo";
import { Response, Test } from "supertest";

import { Storage } from "@google-cloud/storage";

import { ExpressHttpServer } from "./app-server";

export class AppHttpServerExpressE2eTestUtils {
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

  private expressSharedTestUtils: ExpressSharedTestUtils;
  private photoTestUtils: PhotoTestUtils;
  private addPhotoTestUtils: AddPhotoTestUtils;
  private getPhotoTestUtils: GetPhotoTestUtils;
  private searchPhotoTestUtils: SearchPhotoTestUtils;
  private replacePhotoTestUtils: ReplacePhotoTestUtils;
  private deletePhotoTestUtils: DeletePhotoTestUtils;

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
    this.expressSharedTestUtils = new ExpressSharedTestUtils();
    this.addPhotoTestUtils = new AddPhotoTestUtils(
      this.photoMetadataDb,
      this.photoImageDbGcs,
    );
    this.getPhotoTestUtils = new GetPhotoTestUtils(
      this.photoMetadataDb,
      this.photoImageDbGcs,
    );
    this.searchPhotoTestUtils = new SearchPhotoTestUtils(
      this.photoMetadataDb,
      this.photoImageDbGcs,
    );
    this.replacePhotoTestUtils = new ReplacePhotoTestUtils(
      this.photoMetadataDb,
      this.photoImageDbGcs,
    );
    this.deletePhotoTestUtils = new DeletePhotoTestUtils(
      this.photoMetadataDb,
      this.photoImageDbGcs,
    );
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

  async deletePhotoIfNecessary(id: IPhoto["_id"]): Promise<void> {
    await this.photoTestUtils.deletePhotoIfNecessary(id);
  }

  async insertPhotoInDbs(photo: IPhoto): Promise<void> {
    await this.photoTestUtils.insertPhotoInDbs(photo);
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
    await this.addPhotoTestUtils.expectPhotoToBeUploaded(photo);
  }

  expectMatchingPhotos(expectedPhoto: IPhoto, result: IPhoto): void {
    this.getPhotoTestUtils.expectMatchingPhotos(expectedPhoto, result);
    this.getPhotoTestUtils.checkAssertions();
  }

  expectSearchResultMatchingSize(searchResult: any[], size: number): void {
    return this.searchPhotoTestUtils.expectSearchResultMatchingSize(
      searchResult,
      size,
    );
  }

  expectSearchResultMatchingDateOrdering(
    searchResult: any[],
    dateOrdering: SortDirection,
  ): void {
    return this.searchPhotoTestUtils.expectSearchResultMatchingDateOrdering(
      searchResult,
      dateOrdering,
    );
  }

  async expectPhotoToBeReplacedInDb(
    dbPhotoBefore: IPhoto,
    expectedPhoto: IPhoto,
  ): Promise<void> {
    await this.replacePhotoTestUtils.expectPhotoToBeReplacedInDb(
      dbPhotoBefore,
      expectedPhoto,
    );
  }

  async expectPhotoToBeDeletedFromDbs(id: IPhoto["_id"]): Promise<void> {
    await this.deletePhotoTestUtils.expectPhotoToBeDeletedFromDbs(id);
  }
}
