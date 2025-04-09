import { ILogger } from "#logger-context";
import { IPhoto, PhotoEntryPointId, dumbPhotoGenerator } from "#photo-context";
import { HttpErrorCode, IRendering, SortDirection } from "#shared/models";
import { ITag, TagEntryPointId } from "#tag-context";
import { type Express } from "express";
import request from "supertest";

import { ExpressAppServer } from "./app-server";
import {
  addPhotoPath,
  addTagPath,
  deletePhotoPath,
  deleteTagPath,
  getImagePath,
  getMetadataPath,
  getTagPath,
  photoEntryPoints,
  replacePhotoPath,
  replaceTagPath,
  searchPhotoPath,
  tagEntryPoints,
} from "./test-utils";
import { AppServerTestUtils } from "./test-utils/app-server.e2e-test-utils";

describe("ExpressAppServer", () => {
  const testUtils = new AppServerTestUtils(global);

  let expressHttpServer: ExpressAppServer;
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

  describe("tag requests", () => {
    describe(`POST ${addTagPath}`, () => {
      let tagToAdd: ITag;

      beforeEach(() => {
        tagToAdd = { _id: testUtils.generateId(), name: "tag name" };
      });

      afterEach(async () => {
        await testUtils.deleteTagFromDb(tagToAdd._id);
      });

      describe("when the requester does not have the expected right", () => {
        it(`should respond with status code ${HttpErrorCode.Unauthorized} (unauthorized)`, async () => {
          const response = await request(app).post(addTagPath).send(tagToAdd);

          expect(response.statusCode).toBe(HttpErrorCode.Unauthorized);
          expect.assertions(1);
        });
      });

      describe("when the requester has the expected right", () => {
        let token: string;

        beforeEach(async () => {
          token = await testUtils.getToken();
        });

        describe("when the requested tag does not exist in db yet", () => {
          it("should add the requested tag in db", async () => {
            const response = await request(app)
              .post(addTagPath)
              .send(tagToAdd)
              .auth(token, { type: "bearer" });

            expect(response.statusCode).toBe(200);
            testUtils.expectTagToBeInDb(tagToAdd);
            expect.assertions(2);
          });
        });

        describe("when the requested tag already exists in db", () => {
          let tagAlreadyInDb: ITag;

          beforeEach(async () => {
            tagAlreadyInDb = { _id: tagToAdd._id, name: "tag in db" };
            await testUtils.insertTagInDb(tagAlreadyInDb);
          });

          it(`should respond with status code ${HttpErrorCode.Conflict} (conflict)`, async () => {
            const response = await request(app)
              .post(addTagPath)
              .send(tagToAdd)
              .auth(token, { type: "bearer" });

            expect(response.statusCode).toBe(HttpErrorCode.Conflict);
            expect.assertions(1);
          });
        });
      });
    });

    describe(`PUT ${replaceTagPath}`, () => {
      let newTag: ITag;

      beforeEach(() => {
        newTag = { _id: testUtils.generateId(), name: "new tag name" };
      });

      afterEach(async () => {
        await testUtils.deleteTagFromDb(newTag._id);
      });

      describe("when the requester does not have the expected right", () => {
        it(`should respond with status code ${HttpErrorCode.Unauthorized} (unauthorized)`, async () => {
          const response = await request(app).put(replaceTagPath).send(newTag);

          expect(response.statusCode).toBe(HttpErrorCode.Unauthorized);
          expect.assertions(1);
        });
      });

      describe("when the requester has the expected right", () => {
        let token: string;

        beforeEach(async () => {
          token = await testUtils.getToken();
        });

        describe("when the requested tag does not exist in db yet", () => {
          it("should add the requested tag in db", async () => {
            const response = await request(app)
              .put(replaceTagPath)
              .send(newTag)
              .auth(token, { type: "bearer" });

            expect(response.statusCode).toBe(200);
            testUtils.expectTagToBeInDb(newTag);
            expect.assertions(2);
          });
        });

        describe("when the requested tag already exists in db", () => {
          let tagAlreadyInDb: ITag;

          beforeEach(async () => {
            tagAlreadyInDb = { _id: newTag._id, name: "tag in db" };
            await testUtils.insertTagInDb(tagAlreadyInDb);
          });

          it(`should replace the existing tag with the requested one`, async () => {
            const response = await request(app)
              .put(replaceTagPath)
              .send(newTag)
              .auth(token, { type: "bearer" });

            expect(response.statusCode).toBe(200);
            await testUtils.expectTagToBeInDb(newTag);
            expect.assertions(2);
          });
        });
      });
    });

    describe(`GET ${getTagPath}`, () => {
      let tagToGet: ITag;
      let url: string;

      beforeEach(() => {
        tagToGet = { _id: testUtils.generateId(), name: "tag name" };
        url = tagEntryPoints.getFullPathWithParams(TagEntryPointId.GetTag, {
          id: tagToGet._id,
        });
      });

      describe("when the requested tag does not exist in db", () => {
        it(`should respond with status ${HttpErrorCode.NotFound} (not found)`, async () => {
          const response = await request(app).get(url);

          expect(response.statusCode).toBe(HttpErrorCode.NotFound);
          expect.assertions(1);
        });
      });

      describe("when the requested tag exists in db", () => {
        beforeEach(async () => {
          await testUtils.insertTagInDb(tagToGet);
        });

        afterEach(async () => {
          await testUtils.deleteTagFromDb(tagToGet._id);
        });

        it("should return the requested tag", async () => {
          const url = tagEntryPoints.getFullPathWithParams(
            TagEntryPointId.GetTag,
            { id: tagToGet._id },
          );

          const response = await request(app).get(url);
          const tagResponse: ITag = response.body;

          expect(response.statusCode).toBe(200);
          testUtils.expectTagsToBeEqual(tagToGet, tagResponse);
          expect.assertions(2);
        });
      });
    });

    describe(`DELETE ${deleteTagPath}`, () => {
      let tagToDelete: ITag;
      let url: string;

      beforeEach(() => {
        tagToDelete = { _id: testUtils.generateId(), name: "tag to delete" };
        url = tagEntryPoints.getFullPathWithParams(TagEntryPointId.DeleteTag, {
          id: tagToDelete._id,
        });
      });

      describe("when the requester does not have the expected right", () => {
        it(`should respond with status code ${HttpErrorCode.Unauthorized} (unauthorized)`, async () => {
          const response = await request(app).delete(url);

          expect(response.statusCode).toBe(HttpErrorCode.Unauthorized);
          expect.assertions(1);
        });
      });

      describe("when the requester has the expected right", () => {
        let token: string;

        beforeEach(async () => {
          token = await testUtils.getToken();

          await testUtils.insertTagInDb(tagToDelete);
        });

        // making sure to clear db in case of failing test
        afterEach(async () => {
          await testUtils.deleteTagFromDb(tagToDelete._id);
        });

        it("should delete the requested tag from db", async () => {
          const response = await request(app)
            .delete(url)
            .auth(token, { type: "bearer" });

          expect(response.statusCode).toBe(200);
          await testUtils.expectTagToBeDeleted(tagToDelete._id);
          expect.assertions(2);
        });
      });
    });
  });

  describe("photo requests", () => {
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

  describe("unhandled error", () => {
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
