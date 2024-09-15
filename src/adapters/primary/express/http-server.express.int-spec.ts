import { type Express } from "express";
import request from "supertest";

import {
  MongoBase,
  PhotoImageDbGcs,
  PhotoMetadataDbMongo,
  getTestStorage,
} from "@adapters/databases";
import { LoggerWinston } from "@adapters/loggers";
import {
  AddPhotoAjvValidator,
  DeletePhotoAjvValidator,
  GetPhotoAjvValidator,
} from "@adapters/validators";
import {
  AddPhoto,
  DeletePhoto,
  GetPhoto,
  IPhotoImageDb,
  IPhotoMetadataDb,
  IUseCases,
  ReplacePhoto,
} from "@business-logic";
import { Storage } from "@google-cloud/storage";
import { EntryPointId, IValidators, entryPoints } from "@http-server";
import { Logger } from "@logger/models";

import { ExpressAuthHandler } from "../oauth2-jwt-bearer";
import {
  OAuth2ServerMock,
  audience,
  issuerHost,
  issuerPort,
} from "../oauth2-jwt-bearer/test-utils.service";
import { ExpressHttpServer } from "./http-server.express";
import { IAuthHandler } from "./models";
import {
  addPhotoPath,
  deletePhotoPath,
  getImagePath,
  getMetadataPath,
  getPayloadFromPhoto,
  getUrlWithReplacedId,
  photoInDbFromStart,
  photoToAdd,
  photoToDelete,
  replacePhotoPath,
  replacingPhoto,
} from "./services/test-utils.service";

describe("ExpressHttpServer", () => {
  let expressHttpServer: ExpressHttpServer;
  let app: Express;
  let logger: Logger;
  let authHandler: IAuthHandler;

  let mongoBase: MongoBase;
  let metadataDb: IPhotoMetadataDb;
  let imageDb: IPhotoImageDb;

  let storage: Storage;

  let useCases: IUseCases;
  let validators: IValidators;

  let oauth2Server: OAuth2ServerMock;

  beforeAll(async () => {
    mongoBase = new MongoBase(global.__MONGO_URL__, global.__MONGO_DB_NAME);
    await mongoBase.open();
    metadataDb = new PhotoMetadataDbMongo(mongoBase);

    storage = await getTestStorage();
    imageDb = new PhotoImageDbGcs(storage);

    oauth2Server = new OAuth2ServerMock(issuerHost, issuerPort);
    await oauth2Server.start({ aud: audience });
  });

  beforeEach(async () => {
    useCases = {
      getPhoto: new GetPhoto(metadataDb, imageDb),
      addPhoto: new AddPhoto(metadataDb, imageDb),
      replacePhoto: new ReplacePhoto(metadataDb, imageDb),
      deletePhoto: new DeletePhoto(metadataDb, imageDb),
    };

    validators = {
      getPhoto: new GetPhotoAjvValidator(),
      addPhoto: new AddPhotoAjvValidator(),
      replacePhoto: new AddPhotoAjvValidator(),
      deletePhoto: new DeletePhotoAjvValidator(),
    };

    const silentLogger = true;
    logger = new LoggerWinston(silentLogger);

    authHandler = new ExpressAuthHandler(oauth2Server.issuerBaseURL, audience);

    expressHttpServer = new ExpressHttpServer(
      useCases,
      validators,
      logger,
      authHandler,
    );
    expressHttpServer.listen();
    app = expressHttpServer.app;

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
    const payload = getPayloadFromPhoto(photoToAdd);

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
      const url = getUrlWithReplacedId(
        photoInDbFromStart._id,
        EntryPointId.GetPhotoMetadata,
      );
      await request(app).get(url);
      const metadataFromDb = await metadataDb.getById(photoInDbFromStart._id);
      expect(metadataFromDb).toEqual(photoInDbFromStart.metadata);
      expect.assertions(1);
    });
  });

  describe(`GET ${getImagePath}`, () => {
    it("should return the image buffer of the photo with matching id", async () => {
      const url = getUrlWithReplacedId(
        photoInDbFromStart._id,
        EntryPointId.GetPhotoImage,
      );
      await request(app).get(url);
      const imageFromDb = await imageDb.getById(photoInDbFromStart._id);
      expect(imageFromDb).toEqual(photoInDbFromStart.imageBuffer);
      expect.assertions(1);
    });
  });

  describe(`PUT ${replacePhotoPath}`, () => {
    const requiredScopes = entryPoints.getScopes(EntryPointId.ReplacePhoto);
    const payload = getPayloadFromPhoto(replacingPhoto);

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
    const url = getUrlWithReplacedId(
      photoToDelete._id,
      EntryPointId.DeletePhoto,
    );

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
