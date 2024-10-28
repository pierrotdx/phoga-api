import { type Express } from "express";
import request from "supertest";

import {
  AjvValidatorsFactory,
  ExpressTestUtils,
  ParsersFactory,
  dumbPhotoGenerator,
} from "@adapters";
import {
  MongoBase,
  PhotoImageDbGcs,
  PhotoMetadataDbMongo,
  gcsTestUtils,
} from "@adapters/databases";
import { LoggerWinston } from "@adapters/loggers";
import {
  IPhoto,
  IPhotoImageDb,
  IPhotoMetadataDb,
  IUseCases,
  SortDirection,
  UseCasesFactory,
} from "@business-logic";
import { Storage } from "@google-cloud/storage";
import { EntryPointId, IParsers, IValidators, entryPoints } from "@http-server";
import { Logger } from "@logger/models";
import { compareDates } from "@utils";

import { ExpressAuthHandler } from "../../oauth2-jwt-bearer";
import {
  OAuth2ServerMock,
  audience,
  issuerHost,
  issuerPort,
} from "../../oauth2-jwt-bearer/test-utils.service";
import { ExpressHttpServer } from "./app-http-server.express";
import { IAuthHandler } from "./models";

const addPhotoPath = entryPoints.getFullPathRaw(EntryPointId.AddPhoto);
const getMetadataPath = entryPoints.getFullPathRaw(
  EntryPointId.GetPhotoMetadata,
);
const getImagePath = entryPoints.getFullPathRaw(EntryPointId.GetPhotoImage);
const replacePhotoPath = entryPoints.getFullPathRaw(EntryPointId.ReplacePhoto);
const deletePhotoPath = entryPoints.getFullPathRaw(EntryPointId.DeletePhoto);
const searchPhotoPath = entryPoints.getFullPathRaw(EntryPointId.SearchPhoto);

describe("ExpressHttpServer", () => {
  const photoInDbFromStart = dumbPhotoGenerator.generatePhoto();
  const photoToAdd = dumbPhotoGenerator.generatePhoto();
  const replacingPhoto = dumbPhotoGenerator.generatePhoto({
    _id: photoInDbFromStart._id,
  });
  const photoToDelete = dumbPhotoGenerator.generatePhoto();

  let expressHttpServer: ExpressHttpServer;
  let testUtils: ExpressTestUtils;
  let app: Express;
  let logger: Logger;
  let authHandler: IAuthHandler;

  let mongoBase: MongoBase;
  let metadataDb: IPhotoMetadataDb;
  let imageDb: IPhotoImageDb;

  let storage: Storage;

  let useCases: IUseCases;
  let validators: IValidators;
  let parsers: IParsers;

  let oauth2Server: OAuth2ServerMock;

  beforeAll(async () => {
    mongoBase = new MongoBase(global.__MONGO_URL__, global.__MONGO_DB_NAME);
    await mongoBase.open();
    metadataDb = new PhotoMetadataDbMongo(mongoBase);

    storage = await gcsTestUtils.getStorage();
    imageDb = new PhotoImageDbGcs(storage);

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

    testUtils = new ExpressTestUtils();

    await useCases.addPhoto.execute(photoInDbFromStart);
  });

  afterEach(() => {
    expressHttpServer.close();
  });

  afterAll(async () => {
    await mongoBase.close();
    await oauth2Server.close();
  });

  describe(`POST ${addPhotoPath}`, () => {
    const requiredScopes = entryPoints.getScopes(EntryPointId.AddPhoto);
    let payload: ReturnType<typeof testUtils.getPayloadFromPhoto>;

    beforeEach(() => {
      payload = testUtils.getPayloadFromPhoto(photoToAdd);
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
      const imageFromDbBefore = await imageDb.getById(photoToAdd._id);
      const metadataFromDbBefore = await metadataDb.getById(photoToAdd._id);

      const token = await oauth2Server.fetchAccessToken({
        scope: requiredScopes,
      });
      await request(app)
        .post(addPhotoPath)
        .auth(token, { type: "bearer" })
        .send(payload);

      const imageFromDbAfter = await imageDb.getById(photoToAdd._id);
      expect(imageFromDbBefore).toBeUndefined();
      expect(imageFromDbAfter).toEqual(photoToAdd.imageBuffer);

      const metadataFromDbAfter = await metadataDb.getById(photoToAdd._id);
      expect(metadataFromDbBefore).toBeUndefined();
      expect(metadataFromDbAfter).toEqual(photoToAdd.metadata);

      expect.assertions(4);
    });
  });

  describe(`GET ${getMetadataPath}`, () => {
    it("should return the metadata of the photo with matching id", async () => {
      const url = entryPoints.getFullPathWithParams(
        EntryPointId.GetPhotoMetadata,
        { id: photoInDbFromStart._id },
      );
      await request(app).get(url);
      const metadataFromDb = await metadataDb.getById(photoInDbFromStart._id);
      expect(metadataFromDb).toEqual(photoInDbFromStart.metadata);
      expect.assertions(1);
    });
  });

  describe(`GET ${getImagePath}`, () => {
    it("should return the image buffer of the photo with matching id", async () => {
      const url = entryPoints.getFullPathWithParams(
        EntryPointId.GetPhotoImage,
        { id: photoInDbFromStart._id },
      );
      await request(app).get(url);
      const imageFromDb = await imageDb.getById(photoInDbFromStart._id);
      expect(imageFromDb).toEqual(photoInDbFromStart.imageBuffer);
      expect.assertions(1);
    });
  });

  describe(`GET ${searchPhotoPath}`, () => {
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

        let assertionsCount = 0;

        if (queryParams.size) {
          expectSearchResultMatchingSize(searchResult, queryParams.size);
          assertionsCount++;
        }

        if (queryParams.date) {
          expectSearchResultMatchingDateOrdering(
            searchResult,
            queryParams.date,
          );
          assertionsCount++;
        }

        expect.assertions(assertionsCount);
      },
    );
  });

  describe(`PUT ${replacePhotoPath}`, () => {
    const requiredScopes = entryPoints.getScopes(EntryPointId.ReplacePhoto);
    let payload: ReturnType<typeof testUtils.getPayloadFromPhoto>;

    beforeEach(() => {
      payload = testUtils.getPayloadFromPhoto(replacingPhoto);
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
      const imageFromDbBefore = await imageDb.getById(photoInDbFromStart._id);
      const metadataFromDbBefore = await metadataDb.getById(
        photoInDbFromStart._id,
      );

      const token = await oauth2Server.fetchAccessToken({
        scope: requiredScopes,
      });
      await request(app)
        .put(replacePhotoPath)
        .auth(token, { type: "bearer" })
        .send(payload);

      expect(photoInDbFromStart._id).toBe(replacingPhoto._id);

      const imageFromDbAfter = await imageDb.getById(photoInDbFromStart._id);
      expect(imageFromDbAfter).not.toEqual(imageFromDbBefore);
      expect(imageFromDbAfter).toEqual(replacingPhoto.imageBuffer);

      const metadataFromDbAfter = await metadataDb.getById(
        photoInDbFromStart._id,
      );
      expect(metadataFromDbAfter).not.toEqual(metadataFromDbBefore);
      expect(metadataFromDbAfter).toEqual(replacingPhoto.metadata);

      expect.assertions(5);
    });
  });

  describe(`DELETE ${deletePhotoPath}`, () => {
    const requiredScopes = entryPoints.getScopes(EntryPointId.DeletePhoto);
    const url = entryPoints.getFullPathWithParams(EntryPointId.DeletePhoto, {
      id: photoToDelete._id,
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
      await useCases.addPhoto.execute(photoToDelete);
      const imageFromDbBefore = await imageDb.getById(photoToDelete._id);
      const metadataFromDbBefore = await metadataDb.getById(photoToDelete._id);

      const token = await oauth2Server.fetchAccessToken({
        scope: requiredScopes,
      });
      await request(app).delete(url).auth(token, { type: "bearer" });

      expect(imageFromDbBefore).toBeDefined();
      const imageFromDbAfter = await imageDb.getById(photoToDelete._id);
      expect(imageFromDbAfter).toBeUndefined();

      expect(metadataFromDbBefore).toBeDefined();
      const metadataFromDbAfter = await metadataDb.getById(photoToDelete._id);
      expect(metadataFromDbAfter).toBeUndefined();

      expect.assertions(4);
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

function expectSearchResultMatchingSize(searchResult: any[], size: number) {
  expect(searchResult.length).toBeLessThanOrEqual(size);
}

function expectSearchResultMatchingDateOrdering(
  searchResult: any[],
  dateOrdering: SortDirection,
) {
  const searchResultDates = searchResult.map((data) => {
    const stringDate = data.metadata?.date;
    if (stringDate) {
      return new Date(stringDate);
    }
  });
  const orderedDates = [...searchResultDates].sort(compareDates);
  if (dateOrdering === SortDirection.Descending) {
    orderedDates.reverse();
  }
  expect(searchResultDates).toEqual(orderedDates);
}
