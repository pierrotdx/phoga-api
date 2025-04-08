import { ILogger } from "#logger-context";
import { IPhoto, PhotoEntryPointId, dumbPhotoGenerator } from "#photo-context";
import { IRendering, SortDirection } from "#shared/models";
import { type Express } from "express";
import request from "supertest";

import { ExpressHttpServer } from "./app-server";
import {
  addPhotoPath,
  deletePhotoPath,
  getImagePath,
  getMetadataPath,
  photoEntryPoints,
  replacePhotoPath,
  searchPhotoPath,
} from "./test-utils";
import { AppServerTestUtils } from "./test-utils/app-server.e2e-test-utils";

describe("ExpressHttpServer", () => {
  const testUtils = new AppServerTestUtils({
    mongo: {
      url: global.__MONGO_URL__,
      dbName: global.__MONGO_DB_NAME__,
      collections: {
        PhotoMetadata: global.__MONGO_PHOTO_METADATA_COLLECTION__,
      },
    },
    gc: {
      keyFile: global.__GOOGLE_APPLICATION_CREDENTIALS__,
      photoImageBucket: global.__GC_PHOTO_IMAGES_BUCKET__,
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

  let expressHttpServer: ExpressHttpServer;
  let app: Express;
  let logger: ILogger;

  beforeEach(async () => {
    await testUtils.globalBeforeEach();
    expressHttpServer = testUtils.getServer();
    app = expressHttpServer.app;
    logger = testUtils.getLogger();
  });

  afterEach(async () => {
    await testUtils.globalAfterEach();
  });

  afterAll(async () => {
    await testUtils.globalAfterAll();
  });

  describe("Photo router", () => {
    describe(`POST ${addPhotoPath}`, () => {
      let photoToAdd: IPhoto;

      beforeEach(async () => {
        photoToAdd = await dumbPhotoGenerator.generatePhoto();
      });

      afterEach(async () => {
        await testUtils.deletePhotoFromDb(photoToAdd._id);
      });

      it("should add the photo image and metadata to their respective DBs", async () => {
        const token = await testUtils.getToken();
        const addReq = request(app)
          .post(addPhotoPath)
          .auth(token, { type: "bearer" });
        testUtils.addFormDataToReq(addReq, photoToAdd);
        await addReq;
        await testUtils.expectPhotoToBeUploaded(photoToAdd);
      });
    });

    describe(`GET ${getMetadataPath}`, () => {
      let expectedPhoto: IPhoto;

      beforeEach(async () => {
        expectedPhoto = await dumbPhotoGenerator.generatePhoto();
        delete expectedPhoto.imageBuffer;

        await testUtils.insertPhotoInDbs(expectedPhoto);
      });

      afterEach(async () => {
        await testUtils.deletePhotoFromDb(expectedPhoto._id);
      });

      it("should return the metadata of the photo with matching id", async () => {
        const url = photoEntryPoints.getFullPathWithParams(
          PhotoEntryPointId.GetPhotoMetadata,
          { id: expectedPhoto._id },
        );
        const response = await request(app).get(url);
        const responsePhoto = testUtils.getPhotoFromResponse(response);
        testUtils.expectMatchingPhotos(expectedPhoto, responsePhoto);
      });
    });

    describe(`GET ${getImagePath}`, () => {
      let expectedPhoto: IPhoto;

      beforeEach(async () => {
        expectedPhoto = await dumbPhotoGenerator.generatePhoto();
        delete expectedPhoto.metadata;

        await testUtils.insertPhotoInDbs(expectedPhoto);
      });

      afterEach(async () => {
        await testUtils.deletePhotoFromDb(expectedPhoto._id);
      });

      it("should return the image buffer of the photo with matching id", async () => {
        const url = photoEntryPoints.getFullPathWithParams(
          PhotoEntryPointId.GetPhotoImage,
          { id: expectedPhoto._id },
        );
        const response = await request(app).get(url);
        const responsePhoto = testUtils.getPhotoFromResponse(response);
        testUtils.expectMatchingPhotos(expectedPhoto, responsePhoto);
      });
    });

    describe(`GET ${searchPhotoPath}`, () => {
      let storedPhotos: IPhoto[];
      const timeout = 10000;

      beforeEach(async () => {
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
            async (photo) => await testUtils.deletePhotoFromDb(photo._id),
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
            );
          }

          if (queryParams.date) {
            testUtils.expectSearchResultMatchingDateOrdering(
              searchResult,
              queryParams.date,
            );
          }
        },
      );
    });

    describe(`PUT ${replacePhotoPath}`, () => {
      let storedPhoto: IPhoto;
      let newPhoto: IPhoto;
      let newPhotoUrl: string;

      beforeEach(async () => {
        storedPhoto = await dumbPhotoGenerator.generatePhoto();
        await testUtils.insertPhotoInDbs(storedPhoto);

        newPhoto = await dumbPhotoGenerator.generatePhoto({
          _id: storedPhoto._id,
        });
        newPhotoUrl = photoEntryPoints
          .get(PhotoEntryPointId.ReplacePhoto)
          .getFullPathWithParams({ id: storedPhoto._id });
      });

      afterEach(async () => {
        await testUtils.deletePhotoFromDb(storedPhoto._id);
      });

      it("should replace the photo with the one in the request", async () => {
        const dbPhotoBefore = await testUtils.getPhotoFromDb(storedPhoto._id);
        const token = await testUtils.getToken();
        const replaceReq = request(app)
          .put(newPhotoUrl)
          .auth(token, { type: "bearer" });
        testUtils.addFormDataToReq(replaceReq, newPhoto);
        await replaceReq;
        await testUtils.expectPhotoToBeReplacedInDb(dbPhotoBefore, newPhoto);
      });
    });

    describe(`DELETE ${deletePhotoPath}`, () => {
      let photoToDelete: IPhoto;
      let url: string;

      beforeEach(async () => {
        photoToDelete = await dumbPhotoGenerator.generatePhoto();
        url = photoEntryPoints.getFullPathWithParams(
          PhotoEntryPointId.DeletePhoto,
          {
            id: photoToDelete._id,
          },
        );
        await testUtils.insertPhotoInDbs(photoToDelete);
      });

      afterEach(async () => {
        // in case a test fails
        await testUtils.deletePhotoFromDb(photoToDelete._id);
      });

      it("should delete the image and metadata from their respective DBs of the targeted photo", async () => {
        const token = await testUtils.getToken();
        await request(app).delete(url).auth(token, { type: "bearer" });
        await testUtils.expectPhotoToBeDeletedFromDbs(photoToDelete._id);
      });
    });
  });

  describe("error", () => {
    it("should log the error and respond with status code 500", async () => {
      const errorLogSpy = jest.spyOn(logger, "error");
      const errorInducingQueryParams: IRendering = {
        dateOrder: "abc" as SortDirection,
      };
      const token = await testUtils.getToken();

      const response = await request(app)
        .get(searchPhotoPath)
        .query(errorInducingQueryParams)
        .auth(token, { type: "bearer" });

      expect(response.statusCode).toBe(500);
      expect(errorLogSpy).toHaveBeenCalledTimes(1);
      expect.assertions(2);
    });
  });
});
