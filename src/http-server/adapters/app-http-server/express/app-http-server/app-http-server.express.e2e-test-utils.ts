import { Response, Test } from "supertest";

import { IAssertionsCounter } from "@assertions-counter";
import {
  AddPhotoTestUtils,
  DeletePhotoTestUtils,
  GetPhotoTestUtils,
  IPhoto,
  IPhotoImageDb,
  IPhotoMetadataDb,
  PhotoImageDbGcs,
  PhotoMetadataDbMongo,
  ReplacePhotoTestUtils,
  SearchPhotoTestUtils,
  SortDirection,
  UseCasesFactory,
} from "@domain";
import { Storage } from "@google-cloud/storage";
import {
  AjvValidatorsFactory,
  Auth0TokenProvider,
  ControllersTestUtils,
  ExpressAuthHandler,
  ExpressHttpServer,
  ExpressSharedTestUtils,
  ParsersFactory,
} from "@http-server";
import { ILogger, LoggerWinston } from "@logger";
import { DbsTestUtils, IMongoCollections, MongoManager } from "@shared";

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
  private controllersTestUtils: ControllersTestUtils;
  private dbsTestUtils: DbsTestUtils;
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
    this.dbsTestUtils = new DbsTestUtils(
      this.photoMetadataDb,
      this.photoImageDbGcs,
    );
    this.expressSharedTestUtils = new ExpressSharedTestUtils();
    this.addPhotoTestUtils = new AddPhotoTestUtils(
      this.photoMetadataDb,
      this.photoImageDbGcs,
    );
    this.controllersTestUtils = new ControllersTestUtils();
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
    const useCases = new UseCasesFactory(
      this.photoMetadataDb,
      this.photoImageDbGcs,
    ).create();
    const validators = new AjvValidatorsFactory().create();
    const parsers = new ParsersFactory().create();

    const silentLogger = true;
    this.logger = new LoggerWinston(silentLogger);

    this.expressHttpServer = new ExpressHttpServer(
      useCases,
      validators,
      parsers,
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
    await this.dbsTestUtils.deletePhotoIfNecessary(id);
  }

  async insertPhotoInDbs(photo: IPhoto): Promise<void> {
    await this.dbsTestUtils.insertPhotoInDbs(photo);
  }

  async getPhotoFromDb(id: IPhoto["_id"]): Promise<IPhoto> {
    return await this.dbsTestUtils.getPhotoFromDb(id);
  }

  getPayloadFromPhoto(photo: IPhoto) {
    return this.expressSharedTestUtils.getPayloadFromPhoto(photo);
  }

  addFormDataToReq(req: Test, photo: IPhoto): void {
    this.controllersTestUtils.addFormDataToReq(req, photo);
  }

  getPhotoFromResponse(res: Response): IPhoto {
    return this.expressSharedTestUtils.getPhotoFromResponse(res);
  }

  async expectPhotoToBeUploaded(
    photo: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    await this.addPhotoTestUtils.expectPhotoToBeUploaded(
      photo,
      assertionsCounter,
    );
  }

  expectMatchingPhotos(
    expectedPhoto: IPhoto,
    result: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): void {
    this.getPhotoTestUtils.expectMatchingPhotos(
      expectedPhoto,
      result,
      assertionsCounter,
    );
  }

  expectSearchResultMatchingSize(
    searchResult: any[],
    size: number,
    assertionsCounter: IAssertionsCounter,
  ): void {
    return this.searchPhotoTestUtils.expectSearchResultMatchingSize(
      searchResult,
      size,
      assertionsCounter,
    );
  }

  expectSearchResultMatchingDateOrdering(
    searchResult: any[],
    dateOrdering: SortDirection,
    assertionsCounter: IAssertionsCounter,
  ): void {
    return this.searchPhotoTestUtils.expectSearchResultMatchingDateOrdering(
      searchResult,
      dateOrdering,
      assertionsCounter,
    );
  }

  async expectPhotoToBeReplacedInDb(
    dbPhotoBefore: IPhoto,
    expectedPhoto: IPhoto,
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    await this.replacePhotoTestUtils.expectPhotoToBeReplacedInDb(
      dbPhotoBefore,
      expectedPhoto,
      assertionsCounter,
    );
  }

  async expectPhotoToBeDeletedFromDbs(
    id: IPhoto["_id"],
    assertionsCounter: IAssertionsCounter,
  ): Promise<void> {
    await this.deletePhotoTestUtils.expectPhotoToBeDeletedFromDbs(
      id,
      assertionsCounter,
    );
  }
}
