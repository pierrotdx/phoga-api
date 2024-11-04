import { type Express } from "express";
import request from "supertest";

import {
  AjvValidatorsFactory,
  ExpressSharedTestUtils,
  ParsersFactory,
  dumbPhotoGenerator,
} from "@adapters";
import {
  GcsManager,
  GcsTestUtils,
  MongoBase,
  PhotoImageDbGcs,
  PhotoMetadataDbMongo,
} from "@adapters/databases";
import { LoggerWinston } from "@adapters/loggers";
import {
  AddPhotoTestUtils,
  DeletePhotoTestUtils,
  GetPhotoTestUtils,
  IPhoto,
  IPhotoImageDb,
  IPhotoMetadataDb,
  IUseCases,
  ReplacePhotoTestUtils,
  SearchPhotoTestUtils,
  SortDirection,
  UseCasesFactory,
} from "@business-logic";
import { Storage } from "@google-cloud/storage";
import { EntryPointId, IParsers, IValidators, entryPoints } from "@http-server";
import { ILogger } from "@logger/models";
import {
  AssertionsCounter,
  IAssertionsCounter,
  IDbsTestUtilsParams,
} from "@utils";

import { ExpressAuthHandler } from "../../../oauth2-jwt-bearer";
import {
  OAuth2ServerMock,
  audience,
  issuerHost,
  issuerPort,
} from "../../../oauth2-jwt-bearer/test-utils.service";
import { IAuthHandler } from "../models";
import { ExpressHttpServer } from "./app-http-server.express";

const addPhotoPath = entryPoints.getFullPathRaw(EntryPointId.AddPhoto);
const getMetadataPath = entryPoints.getFullPathRaw(
  EntryPointId.GetPhotoMetadata,
);
const getImagePath = entryPoints.getFullPathRaw(EntryPointId.GetPhotoImage);
const replacePhotoPath = entryPoints.getFullPathRaw(EntryPointId.ReplacePhoto);
const deletePhotoPath = entryPoints.getFullPathRaw(EntryPointId.DeletePhoto);
const searchPhotoPath = entryPoints.getFullPathRaw(EntryPointId.SearchPhoto);

describe("ExpressHttpServer", () => {
  const storedPhoto = dumbPhotoGenerator.generatePhoto();

  let expressHttpServer: ExpressHttpServer;
  let expressTestUtils: ExpressSharedTestUtils;
  let gcsTestUtils: GcsTestUtils;
  let assertionsCounter: IAssertionsCounter;
  let app: Express;
  let logger: ILogger;
  let authHandler: IAuthHandler;

  let mongoBase: MongoBase;
  let metadataDb: IPhotoMetadataDb;
  let imageDb: IPhotoImageDb;
  let dbsTestUtilsParams: IDbsTestUtilsParams;

  let storage: Storage;

  let useCases: IUseCases;
  let validators: IValidators;
  let parsers: IParsers;

  let oauth2Server: OAuth2ServerMock;

  beforeAll(async () => {
    mongoBase = new MongoBase(global.__MONGO_URL__, global.__MONGO_DB_NAME);
    await mongoBase.open();
    metadataDb = new PhotoMetadataDbMongo(mongoBase);

    const gcsManager = new GcsManager();
    storage = await gcsManager.getStorage();
    gcsTestUtils = new GcsTestUtils(gcsManager);
    await gcsTestUtils.deleteAllImages();
    imageDb = new PhotoImageDbGcs(storage);

    dbsTestUtilsParams = { metadataDb, imageDb };

    oauth2Server = new OAuth2ServerMock(issuerHost, issuerPort);
    await oauth2Server.start({ aud: audience });
  });

  beforeEach(async () => {
    useCases = new UseCasesFactory(metadataDb, imageDb).create();
    validators = new AjvValidatorsFactory().create();
    parsers = new ParsersFactory().create();

    const silentLogger = true;
    logger = new LoggerWinston(silentLogger);

    authHandler = new ExpressAuthHandler(oauth2Server.issuerBaseURL, audience);

    expressHttpServer = new ExpressHttpServer(
      useCases,
      validators,
      parsers,
      logger,
      authHandler,
    );
    expressHttpServer.listen();
    app = expressHttpServer.app;

    expressTestUtils = new ExpressSharedTestUtils();
    assertionsCounter = new AssertionsCounter();
  });

  afterEach(() => {
    expressHttpServer.close();
  });

  afterAll(async () => {
    await mongoBase.close();
    await oauth2Server.close();
  });

  describe(`POST ${addPhotoPath}`, () => {
    let addPhotoTestUtils: AddPhotoTestUtils;
    const photoToAdd = dumbPhotoGenerator.generatePhoto();
    const requiredScopes = entryPoints.getScopes(EntryPointId.AddPhoto);
    let payload: ReturnType<typeof expressTestUtils.getPayloadFromPhoto>;

    beforeEach(() => {
      addPhotoTestUtils = new AddPhotoTestUtils(dbsTestUtilsParams);
      payload = expressTestUtils.getPayloadFromPhoto(photoToAdd);
    });

    it("should deny the access and respond with status code 401 if no token is associated to the request", async () => {
      const response = await request(app).post(addPhotoPath).send(payload);
      expect(response.statusCode).toBe(401);
      expect.assertions(1);
    });

    it("should deny the access and respond with status code 403 if the token scope of the request is invalid", async () => {
      const token = await oauth2Server.fetchAccessToken();
      const response = await request(app)
        .post(addPhotoPath)
        .auth(token, { type: "bearer" })
        .send(payload);
      expect(response.statusCode).toBe(403);
      expect.assertions(1);
    });

    it("should add the photo image and metadata to their respective DBs", async () => {
      const token = await oauth2Server.fetchAccessToken({
        scope: requiredScopes,
      });
      await request(app)
        .post(addPhotoPath)
        .auth(token, { type: "bearer" })
        .send(payload);

      await addPhotoTestUtils.expectPhotoImageToBeInDb(
        photoToAdd,
        assertionsCounter,
      );
      await addPhotoTestUtils.expectPhotoMetadataToBeInDb(
        photoToAdd,
        assertionsCounter,
      );
      assertionsCounter.checkAssertions();
    });
  });

  describe(`GET ${getMetadataPath}`, () => {
    let getPhotoTestUtils: GetPhotoTestUtils;

    beforeEach(async () => {
      getPhotoTestUtils = new GetPhotoTestUtils(dbsTestUtilsParams);
      await getPhotoTestUtils.insertPhotoInDbs(storedPhoto);
    });

    it("should return the metadata of the photo with matching id", async () => {
      const url = entryPoints.getFullPathWithParams(
        EntryPointId.GetPhotoMetadata,
        { id: storedPhoto._id },
      );
      const response = await request(app).get(url);
      const responsePhoto = expressTestUtils.getPhotoFromResponse(response);
      getPhotoTestUtils.expectMatchingPhotoIds(
        storedPhoto,
        responsePhoto,
        assertionsCounter,
      );
      getPhotoTestUtils.expectMatchingPhotoMetadata(
        storedPhoto,
        responsePhoto,
        assertionsCounter,
      );
      assertionsCounter.checkAssertions();
    });
  });

  describe(`GET ${getImagePath}`, () => {
    let getPhotoTestUtils: GetPhotoTestUtils;

    beforeEach(() => {
      getPhotoTestUtils = new GetPhotoTestUtils(dbsTestUtilsParams);
    });

    it("should return the image buffer of the photo with matching id", async () => {
      const url = entryPoints.getFullPathWithParams(
        EntryPointId.GetPhotoImage,
        { id: storedPhoto._id },
      );
      const response = await request(app).get(url);
      const responsePhoto = expressTestUtils.getPhotoFromResponse(response);
      getPhotoTestUtils.expectMatchingPhotoIds(
        storedPhoto,
        responsePhoto,
        assertionsCounter,
      );
      getPhotoTestUtils.expectMatchingPhotoImages(
        storedPhoto,
        responsePhoto,
        assertionsCounter,
      );
      assertionsCounter.checkAssertions();
    });
  });

  describe(`GET ${searchPhotoPath}`, () => {
    let searchPhotoTestUtils: SearchPhotoTestUtils;

    beforeEach(() => {
      searchPhotoTestUtils = new SearchPhotoTestUtils(dbsTestUtilsParams);
    });

    it.each`
      queryParams
      ${{ size: 1 }}
      ${{ size: 2, dateOrder: SortDirection.Ascending }}
      ${{ size: 2, dateOrder: SortDirection.Descending }}
    `(
      "should return the photos matching the query params: $queryParams",
      async ({ queryParams }) => {
        const response = await request(app)
          .get(searchPhotoPath)
          .query(queryParams);
        const searchResult = response.body as IPhoto[];

        if (queryParams.size) {
          searchPhotoTestUtils.expectSearchResultMatchingSize(
            searchResult,
            queryParams.size,
            assertionsCounter,
          );
        }

        if (queryParams.date) {
          searchPhotoTestUtils.expectSearchResultMatchingDateOrdering(
            searchResult,
            queryParams.date,
            assertionsCounter,
          );
        }

        assertionsCounter.checkAssertions();
      },
    );
  });

  describe(`PUT ${replacePhotoPath}`, () => {
    let replacingPhoto: IPhoto;
    let replacePhotoTestUtils: ReplacePhotoTestUtils;
    const requiredScopes = entryPoints.getScopes(EntryPointId.ReplacePhoto);
    let payload: ReturnType<typeof expressTestUtils.getPayloadFromPhoto>;

    beforeEach(() => {
      replacingPhoto = dumbPhotoGenerator.generatePhoto({
        _id: storedPhoto._id,
      });
      replacePhotoTestUtils = new ReplacePhotoTestUtils({
        metadataDb,
        imageDb,
      });
      payload = expressTestUtils.getPayloadFromPhoto(replacingPhoto);
    });

    it("should deny the access and respond with status code 403 if the token scope of the request is invalid", async () => {
      const token = await oauth2Server.fetchAccessToken();
      const response = await request(app)
        .post(replacePhotoPath)
        .auth(token, { type: "bearer" })
        .send(payload);
      expect(response.statusCode).toBe(403);
      expect.assertions(1);
    });

    it("should replace the photo with the one in the request", async () => {
      const dbImageBefore = await imageDb.getById(storedPhoto._id);
      const dbMetadataBefore = await metadataDb.getById(storedPhoto._id);
      const token = await oauth2Server.fetchAccessToken({
        scope: requiredScopes,
      });
      await request(app)
        .put(replacePhotoPath)
        .auth(token, { type: "bearer" })
        .send(payload);
      replacePhotoTestUtils.expectMatchingPhotoIds(
        storedPhoto,
        replacingPhoto,
        assertionsCounter,
      );
      await replacePhotoTestUtils.expectImageToBeReplacedInDb(
        dbImageBefore,
        replacingPhoto,
        assertionsCounter,
      );
      await replacePhotoTestUtils.expectMetadataToBeReplacedInDb(
        dbMetadataBefore,
        replacingPhoto,
        assertionsCounter,
      );
      assertionsCounter.checkAssertions();
    });
  });

  describe(`DELETE ${deletePhotoPath}`, () => {
    let photoToDelete: IPhoto;
    let deletePhotoTestUtils: DeletePhotoTestUtils;
    const requiredScopes = entryPoints.getScopes(EntryPointId.DeletePhoto);
    let url: string;

    beforeEach(async () => {
      photoToDelete = dumbPhotoGenerator.generatePhoto();
      url = entryPoints.getFullPathWithParams(EntryPointId.DeletePhoto, {
        id: photoToDelete._id,
      });
      deletePhotoTestUtils = new DeletePhotoTestUtils(dbsTestUtilsParams);
      await deletePhotoTestUtils.insertPhotoInDbs(photoToDelete);
    });

    afterEach(async () => {
      // in case a test fails
      await deletePhotoTestUtils.deletePhotoIfNecessary(photoToDelete._id);
    });

    it("should deny the access and respond with status code 403 if the token scope of the request is invalid", async () => {
      const token = await oauth2Server.fetchAccessToken();
      const response = await request(app)
        .delete(url)
        .auth(token, { type: "bearer" });
      expect(response.statusCode).toBe(403);
      expect.assertions(1);
    });

    it("should delete the image and metadata from their respective DBs of the targeted photo", async () => {
      const dbImageBefore = await imageDb.getById(photoToDelete._id);
      const dbMetadataBefore = await metadataDb.getById(photoToDelete._id);

      const token = await oauth2Server.fetchAccessToken({
        scope: requiredScopes,
      });
      await request(app).delete(url).auth(token, { type: "bearer" });

      await deletePhotoTestUtils.expectMetadataToBeDeletedFromDb(
        dbMetadataBefore,
        photoToDelete,
        assertionsCounter,
      );
      await deletePhotoTestUtils.expectImageToBeDeletedFromDb(
        dbImageBefore,
        photoToDelete,
        assertionsCounter,
      );
      assertionsCounter.checkAssertions();
    });
  });

  describe("error", () => {
    it("should log the error and respond with status code 500", async () => {
      const errorLogSpy = jest.spyOn(logger, "error");

      const incorrectPayload = {};
      const requiredScopes = entryPoints.getScopes(EntryPointId.ReplacePhoto);
      const token = await oauth2Server.fetchAccessToken({
        scope: requiredScopes,
      });
      const response = await request(app)
        .put(replacePhotoPath)
        .send(incorrectPayload)
        .auth(token, { type: "bearer" });

      expect(response.statusCode).toBe(500);
      expect(errorLogSpy).toHaveBeenCalledTimes(1);
      expect.assertions(2);
    });
  });
});
