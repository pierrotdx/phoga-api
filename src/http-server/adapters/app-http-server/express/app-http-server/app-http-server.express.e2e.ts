import { type Express } from "express";
import { omit } from "ramda";
import request from "supertest";

import { AssertionsCounter, IAssertionsCounter } from "@assertions-counter";
import { IPhoto, SortDirection } from "@domain";
import { EntryPointId, entryPoints } from "@http-server";
import { ILogger } from "@logger";
import { dumbPhotoGenerator } from "@shared";

import { ExpressHttpServer } from "./app-http-server.express";
import { AppHttpServerExpressE2eTestUtils } from "./app-http-server.express.e2e-test-utils";

const addPhotoPath = entryPoints.getFullPathRaw(EntryPointId.AddPhoto);
const getMetadataPath = entryPoints.getFullPathRaw(
  EntryPointId.GetPhotoMetadata,
);
const getImagePath = entryPoints.getFullPathRaw(EntryPointId.GetPhotoImage);
const replacePhotoPath = entryPoints.getFullPathRaw(EntryPointId.ReplacePhoto);
const deletePhotoPath = entryPoints.getFullPathRaw(EntryPointId.DeletePhoto);
const searchPhotoPath = entryPoints.getFullPathRaw(EntryPointId.SearchPhoto);

describe("ExpressHttpServer", () => {
  let storedPhoto: IPhoto;
  const testUtils = new AppHttpServerExpressE2eTestUtils({
    mongo: {
      url: global.__MONGO_URL__,
      dbName: global.__MONGO_DB_NAME__,
    },
    gc: {
      keyFile: global.__GOOGLE_APPLICATION_CREDENTIALS__,
    },
    tokenProvider: {
      domain: global.__OAUTH2_AUTHORIZATION_SERVER_DOMAIN__,
      clientId: global.__OAUTH2_CLIENT_ID__,
      clientSecret: global.__OAUTH2_CLIENT_SECRET__,
      username: global.__OAUTH2_USER_NAME__,
      password: global.__OAUTH2_USER_PASSWORD__,
      audience: global.__OAUTH2_AUDIENCE__,
    },
  });

  let assertionsCounter: IAssertionsCounter;
  let expressHttpServer: ExpressHttpServer;
  let app: Express;
  let logger: ILogger;

  beforeEach(async () => {
    await testUtils.internalSetup();
    expressHttpServer = testUtils.getServer();
    app = expressHttpServer.app;
    logger = testUtils.getLogger();

    storedPhoto = await dumbPhotoGenerator.generatePhoto();
    await testUtils.insertPhotoInDbs(storedPhoto);
    assertionsCounter = new AssertionsCounter();
  });

  afterEach(async () => {
    await testUtils.deletePhotoIfNecessary(storedPhoto._id);
    await testUtils.internalTeardown();
  });

  afterAll(async () => {
    await testUtils.globalInternalTeardown();
  });

  describe(`POST ${addPhotoPath}`, () => {
    const requiredScopes = entryPoints.getScopes(EntryPointId.AddPhoto);
    let photoToAdd: IPhoto;
    let payload: ReturnType<typeof testUtils.getPayloadFromPhoto>;

    beforeEach(async () => {
      photoToAdd = await dumbPhotoGenerator.generatePhoto();
      payload = testUtils.getPayloadFromPhoto(photoToAdd);
    });

    afterEach(async () => {
      await testUtils.deletePhotoIfNecessary(photoToAdd._id);
    });

    it("should deny the access and respond with status code 401 if no token is associated to the request", async () => {
      const response = await request(app).post(addPhotoPath).send(payload);
      expect(response.statusCode).toBe(401);
      expect.assertions(1);
    });

    it("should deny the access and respond with status code 403 if the token scope of the request is invalid", async () => {
      const token = await testUtils.getToken();
      const response = await request(app)
        .post(addPhotoPath)
        .auth(token, { type: "bearer" })
        .send(payload);
      expect(response.statusCode).toBe(403);
      expect.assertions(1);
    });

    it("should add the photo image and metadata to their respective DBs", async () => {
      const token = await testUtils.getToken(requiredScopes);
      await request(app)
        .post(addPhotoPath)
        .auth(token, { type: "bearer" })
        .send(payload);
      await testUtils.expectPhotoToBeUploaded(photoToAdd, assertionsCounter);
    });
  });

  describe(`GET ${getMetadataPath}`, () => {
    let expectedPhoto: IPhoto;

    beforeEach(async () => {
      expectedPhoto = omit(["imageBuffer"], storedPhoto);
      await testUtils.insertPhotoInDbs(expectedPhoto);
    });

    afterEach(async () => {
      await testUtils.deletePhotoIfNecessary(expectedPhoto._id);
    });

    it("should return the metadata of the photo with matching id", async () => {
      const url = entryPoints.getFullPathWithParams(
        EntryPointId.GetPhotoMetadata,
        { id: expectedPhoto._id },
      );
      const response = await request(app).get(url);
      const responsePhoto = testUtils.getPhotoFromResponse(response);
      testUtils.expectMatchingPhotos(
        expectedPhoto,
        responsePhoto,
        assertionsCounter,
      );
      assertionsCounter.checkAssertions();
    });
  });

  describe(`GET ${getImagePath}`, () => {
    let expectedPhoto: IPhoto;

    beforeEach(async () => {
      expectedPhoto = omit(["metadata"], storedPhoto);
      await testUtils.insertPhotoInDbs(expectedPhoto);
    });

    afterEach(async () => {
      await testUtils.deletePhotoIfNecessary(expectedPhoto._id);
    });

    it("should return the image buffer of the photo with matching id", async () => {
      const url = entryPoints.getFullPathWithParams(
        EntryPointId.GetPhotoImage,
        { id: expectedPhoto._id },
      );
      const response = await request(app).get(url);
      const responsePhoto = testUtils.getPhotoFromResponse(response);
      testUtils.expectMatchingPhotos(
        expectedPhoto,
        responsePhoto,
        assertionsCounter,
      );
      assertionsCounter.checkAssertions();
    });
  });

  describe(`GET ${searchPhotoPath}`, () => {
    let storedPhotos: IPhoto[];
    const timeout = 10000;

    beforeEach(async () => {
      await testUtils.deletePhotoIfNecessary(storedPhoto._id);
      storedPhotos = await Promise.all([
        await dumbPhotoGenerator.generatePhoto(),
        await dumbPhotoGenerator.generatePhoto(),
        await dumbPhotoGenerator.generatePhoto(),
      ]);
      await Promise.all(
        storedPhotos.map(
          async (photo) => await testUtils.insertPhotoInDbs(photo),
        ),
      );
    }, timeout);

    afterEach(async () => {
      await Promise.all(
        storedPhotos.map(
          async (photo) => await testUtils.deletePhotoIfNecessary(photo._id),
        ),
      );
    }, timeout);

    it.each`
      queryParams
      ${{ size: 1 }}
      ${{ size: 2, dateOrder: SortDirection.Ascending }}
      ${{ size: 3, dateOrder: SortDirection.Descending }}
    `(
      "should return the photos matching the query params: $queryParams",
      async ({ queryParams }) => {
        const response = await request(app)
          .get(searchPhotoPath)
          .query(queryParams);
        const searchResult = response.body as IPhoto[];

        if (queryParams.size) {
          testUtils.expectSearchResultMatchingSize(
            searchResult,
            queryParams.size,
            assertionsCounter,
          );
        }

        if (queryParams.date) {
          testUtils.expectSearchResultMatchingDateOrdering(
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
    const requiredScopes = entryPoints.getScopes(EntryPointId.ReplacePhoto);
    let replacingPhoto: IPhoto;
    let replacePhotoUrl: string;
    let payload: ReturnType<typeof testUtils.getPayloadFromPhoto>;

    beforeEach(async () => {
      replacingPhoto = await dumbPhotoGenerator.generatePhoto({
        _id: storedPhoto._id,
      });
      replacePhotoUrl = entryPoints
        .get(EntryPointId.ReplacePhoto)
        .getFullPathWithParams({ id: storedPhoto._id });
      payload = testUtils.getPayloadFromPhoto(replacingPhoto);
    });

    it("should deny the access and respond with status code 403 if the token scope of the request is invalid", async () => {
      const token = await testUtils.getToken();
      const response = await request(app)
        .put(replacePhotoUrl)
        .auth(token, { type: "bearer" })
        .send(payload);
      expect(response.statusCode).toBe(403);
      expect.assertions(1);
    });

    it("should replace the photo with the one in the request", async () => {
      const dbPhotoBefore = await testUtils.getPhotoFromDb(storedPhoto._id);
      const token = await testUtils.getToken(requiredScopes);
      await request(app)
        .put(replacePhotoUrl)
        .auth(token, { type: "bearer" })
        .send(payload);
      await testUtils.expectPhotoToBeReplacedInDb(
        dbPhotoBefore,
        replacingPhoto,
        assertionsCounter,
      );
    });
  });

  describe(`DELETE ${deletePhotoPath}`, () => {
    const requiredScopes = entryPoints.getScopes(EntryPointId.DeletePhoto);
    let photoToDelete: IPhoto;
    let url: string;

    beforeEach(async () => {
      photoToDelete = await dumbPhotoGenerator.generatePhoto();
      url = entryPoints.getFullPathWithParams(EntryPointId.DeletePhoto, {
        id: photoToDelete._id,
      });
      await testUtils.insertPhotoInDbs(photoToDelete);
    });

    afterEach(async () => {
      // in case a test fails
      await testUtils.deletePhotoIfNecessary(photoToDelete._id);
    });

    it("should deny the access and respond with status code 403 if the token scope of the request is invalid", async () => {
      const token = await testUtils.getToken();
      const response = await request(app)
        .delete(url)
        .auth(token, { type: "bearer" });
      expect(response.statusCode).toBe(403);
      expect.assertions(1);
    });

    it("should delete the image and metadata from their respective DBs of the targeted photo", async () => {
      const token = await testUtils.getToken(requiredScopes);
      await request(app).delete(url).auth(token, { type: "bearer" });
      await testUtils.expectPhotoToBeDeletedFromDbs(
        photoToDelete._id,
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
      const token = await testUtils.getToken(requiredScopes);
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
