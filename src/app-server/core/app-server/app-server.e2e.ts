import { ILogger } from "#logger-context";
import {
  IPhoto,
  PhotoEntryPointId,
  PhotoTestUtils,
  dumbPhotoGenerator,
} from "#photo-context";
import { HttpErrorCode, IRendering, SortDirection } from "#shared/models";
import {
  ISearchTagFilter,
  ITag,
  TagEntryPointId,
  TagTestUtils,
} from "#tag-context";
import { type Express } from "express";
import { omit } from "ramda";
import request from "supertest";

import { ExpressAppServer } from "./app-server";
import {
  addPhotoPath,
  addTagPath,
  deletePhotoPath,
  deleteTagPath,
  getImagePath,
  getPhotoDataPath,
  getTagPath,
  photoEntryPoints,
  replacePhotoPath,
  replaceTagPath,
  searchPhotoPath,
  searchTagPath,
  tagEntryPoints,
} from "./test-utils";
import { AppServerTestUtils } from "./test-utils/app-server.e2e-test-utils";

describe("ExpressAppServer", () => {
  const appTestUtils = new AppServerTestUtils(global);

  let expressHttpServer: ExpressAppServer;
  let app: Express;
  let logger: ILogger;

  beforeEach(async () => {
    await appTestUtils.globalBeforeEach();
    expressHttpServer = appTestUtils.getServer();
    app = expressHttpServer.app;
    logger = appTestUtils.getLogger();
  });

  afterEach(async () => {
    await appTestUtils.globalAfterEach();
  });

  afterAll(async () => {
    await appTestUtils.globalAfterAll();
  });

  describe("tag requests", () => {
    let tagTestUtils: TagTestUtils;

    beforeEach(() => {
      const tagDb = appTestUtils.getTagDb();
      tagTestUtils = new TagTestUtils(tagDb);
    });

    afterAll(async () => {
      // making sure to clean up the db
      await tagTestUtils.deleteAllTagsFromDb();
    });

    describe(`POST ${addTagPath}`, () => {
      let tagToAdd: ITag;

      beforeEach(() => {
        tagToAdd = { _id: appTestUtils.generateId(), name: "tag name" };
      });

      afterEach(async () => {
        await tagTestUtils.deleteTagFromDb(tagToAdd._id);
      });

      afterAll(async () => {
        // making sure the db is cleaned up after tests
        await tagTestUtils.deleteAllTagsFromDb();
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
          token = await appTestUtils.getToken();
        });

        describe("when the requested tag does not exist in db yet", () => {
          it("should add the requested tag in db", async () => {
            const response = await request(app)
              .post(addTagPath)
              .send(tagToAdd)
              .auth(token, { type: "bearer" });

            expect(response.statusCode).toBe(200);
            tagTestUtils.expectTagToBeInDb(tagToAdd);
            expect.assertions(2);
          });
        });

        describe("when the requested tag already exists in db", () => {
          let tagAlreadyInDb: ITag;

          beforeEach(async () => {
            tagAlreadyInDb = { _id: tagToAdd._id, name: "tag in db" };
            await tagTestUtils.insertTagInDb(tagAlreadyInDb);
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
        newTag = { _id: appTestUtils.generateId(), name: "new tag name" };
      });

      afterEach(async () => {
        await tagTestUtils.deleteTagFromDb(newTag._id);
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
          token = await appTestUtils.getToken();
        });

        describe("when the requested tag does not exist in db yet", () => {
          it("should add the requested tag in db", async () => {
            const response = await request(app)
              .put(replaceTagPath)
              .send(newTag)
              .auth(token, { type: "bearer" });

            expect(response.statusCode).toBe(200);
            tagTestUtils.expectTagToBeInDb(newTag);
            expect.assertions(2);
          });
        });

        describe("when the requested tag already exists in db", () => {
          let tagAlreadyInDb: ITag;

          beforeEach(async () => {
            tagAlreadyInDb = { _id: newTag._id, name: "tag in db" };
            await tagTestUtils.insertTagInDb(tagAlreadyInDb);
          });

          it(`should replace the existing tag with the requested one`, async () => {
            const response = await request(app)
              .put(replaceTagPath)
              .send(newTag)
              .auth(token, { type: "bearer" });

            expect(response.statusCode).toBe(200);
            await tagTestUtils.expectTagToBeInDb(newTag);
            expect.assertions(2);
          });
        });
      });
    });

    describe(`GET ${getTagPath}`, () => {
      let tagToGet: ITag;
      let url: string;

      beforeEach(() => {
        tagToGet = { _id: appTestUtils.generateId(), name: "tag name" };
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
          await tagTestUtils.insertTagInDb(tagToGet);
        });

        afterEach(async () => {
          await tagTestUtils.deleteTagFromDb(tagToGet._id);
        });

        it("should return the requested tag", async () => {
          const url = tagEntryPoints.getFullPathWithParams(
            TagEntryPointId.GetTag,
            { id: tagToGet._id },
          );

          const response = await request(app).get(url);
          const tagResponse: ITag = response.body;

          expect(response.statusCode).toBe(200);
          tagTestUtils.expectTagsToBeEqual(tagToGet, tagResponse);
          expect.assertions(2);
        });
      });
    });

    describe(`GET ${searchTagPath}`, () => {
      const dbTags: ITag[] = [
        { _id: "tag1", name: "hello" },
        { _id: "tag2", name: "bye" },
      ];

      beforeEach(async () => {
        await tagTestUtils.insertTagsInDb(dbTags);
      });

      afterEach(async () => {
        await tagTestUtils.deleteTagsFromDb(dbTags);
      });

      describe("when there is no filter", () => {
        it("should return all the tags in db", async () => {
          const response = await request(app).get(searchTagPath);

          const expectedTags = dbTags;
          const responseTags = response.body;

          tagTestUtils.expectEqualTagArrays(responseTags, expectedTags);
        });
      });

      describe("when there is a filter", () => {
        const filter: ISearchTagFilter = { name: "hello" };

        it("should return the tags matching the filter", async () => {
          const expectedTags: ITag[] = [dbTags[0]];

          const response = await request(app).get(searchTagPath).query(filter);

          const responseTags: ITag[] = response.body;
          tagTestUtils.expectEqualTagArrays(responseTags, expectedTags);
        });
      });
    });

    describe(`DELETE ${deleteTagPath}`, () => {
      let tagToDelete: ITag;
      let url: string;

      beforeEach(() => {
        tagToDelete = { _id: appTestUtils.generateId(), name: "tag to delete" };
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
          token = await appTestUtils.getToken();

          await tagTestUtils.insertTagInDb(tagToDelete);
        });

        // making sure to clear db in case of failing test
        afterEach(async () => {
          await tagTestUtils.deleteTagFromDb(tagToDelete._id);
        });

        it("should delete the requested tag from db", async () => {
          const response = await request(app)
            .delete(url)
            .auth(token, { type: "bearer" });

          expect(response.statusCode).toBe(200);
          await tagTestUtils.expectTagToBeDeleted(tagToDelete._id);
          expect.assertions(2);
        });
      });
    });
  });

  describe("photo requests", () => {
    let photoTestUtils: PhotoTestUtils;

    beforeEach(() => {
      const photoDataDb = appTestUtils.getPhotoDataDb();
      const photoImageDb = appTestUtils.getPhotoImageDb();
      photoTestUtils = new PhotoTestUtils(photoDataDb, photoImageDb);
    });

    describe(`POST ${addPhotoPath}`, () => {
      let photoToAdd: IPhoto;

      beforeEach(async () => {
        photoToAdd = await dumbPhotoGenerator.generatePhoto();
      });

      afterEach(async () => {
        await photoTestUtils.deletePhotoFromDb(photoToAdd._id);
      });

      it("should add the photo image and base data to their respective DBs", async () => {
        const token = await appTestUtils.getToken();
        const addReq = request(app)
          .post(addPhotoPath)
          .auth(token, { type: "bearer" });
        appTestUtils.addFormDataToReq(addReq, photoToAdd);
        await addReq;
        await photoTestUtils.expectPhotoToBeUploaded(photoToAdd);
      });
    });

    describe(`GET ${getPhotoDataPath}`, () => {
      let expectedPhoto: IPhoto;

      beforeEach(async () => {
        expectedPhoto = omit(
          ["imageBuffer"],
          await dumbPhotoGenerator.generatePhoto(),
        );
        delete expectedPhoto.imageBuffer;

        await photoTestUtils.insertPhotoInDbs(expectedPhoto);
      });

      afterEach(async () => {
        await photoTestUtils.deletePhotoFromDb(expectedPhoto._id);
      });

      it("should return the base data of the photo with matching id", async () => {
        const url = photoEntryPoints.getFullPathWithParams(
          PhotoEntryPointId.GetPhotoData,
          { id: expectedPhoto._id },
        );
        const response = await request(app).get(url);
        const responsePhoto = appTestUtils.getPhotoFromResponse(response);
        photoTestUtils.expectMatchingPhotos(expectedPhoto, responsePhoto);
      });
    });

    describe(`GET ${getImagePath}`, () => {
      let expectedPhoto: IPhoto;

      beforeEach(async () => {
        expectedPhoto = await dumbPhotoGenerator.generatePhoto();
        delete expectedPhoto.metadata;

        await photoTestUtils.insertPhotoInDbs(expectedPhoto);
      });

      afterEach(async () => {
        await photoTestUtils.deletePhotoFromDb(expectedPhoto._id);
      });

      it("should return the image buffer of the photo with matching id", async () => {
        const url = photoEntryPoints.getFullPathWithParams(
          PhotoEntryPointId.GetPhotoImage,
          { id: expectedPhoto._id },
        );
        const response = await request(app).get(url);
        const responsePhoto = appTestUtils.getPhotoFromResponse(response);
        photoTestUtils.expectMatchingPhotos(expectedPhoto, responsePhoto);
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
            async (photo) => await photoTestUtils.insertPhotoInDbs(photo),
          ),
        );
      }, timeout);

      afterEach(async () => {
        await Promise.all(
          storedPhotos.map(
            async (photo) => await photoTestUtils.deletePhotoFromDb(photo._id),
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
            photoTestUtils.expectArraySizeToBeAtMost(
              searchResult,
              queryParams.size,
            );
          }

          if (queryParams.date) {
            photoTestUtils.expectPhotosOrderToBe(
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
        await photoTestUtils.insertPhotoInDbs(storedPhoto);

        newPhoto = await dumbPhotoGenerator.generatePhoto({
          _id: storedPhoto._id,
        });
        newPhotoUrl = photoEntryPoints
          .get(PhotoEntryPointId.ReplacePhoto)
          .getFullPathWithParams({ id: storedPhoto._id });
      });

      afterEach(async () => {
        await photoTestUtils.deletePhotoFromDb(storedPhoto._id);
      });

      it("should replace the photo with the one in the request", async () => {
        const dbPhotoBefore = await photoTestUtils.getPhotoFromDb(
          storedPhoto._id,
        );
        const token = await appTestUtils.getToken();
        const replaceReq = request(app)
          .put(newPhotoUrl)
          .auth(token, { type: "bearer" });
        appTestUtils.addFormDataToReq(replaceReq, newPhoto);
        await replaceReq;
        await photoTestUtils.expectPhotoToBeReplacedInDb(
          dbPhotoBefore._id,
          newPhoto,
        );
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
        await photoTestUtils.insertPhotoInDbs(photoToDelete);
      });

      afterEach(async () => {
        // in case a test fails
        await photoTestUtils.deletePhotoFromDb(photoToDelete._id);
      });

      it("should delete the image and base data from their respective DBs of the targeted photo", async () => {
        const token = await appTestUtils.getToken();
        await request(app).delete(url).auth(token, { type: "bearer" });
        await photoTestUtils.expectPhotoToBeDeletedFromDbs(photoToDelete._id);
      });
    });
  });

  describe("unhandled error", () => {
    it("should log the error and respond with status code 500", async () => {
      const errorLogSpy = jest.spyOn(logger, "error");
      const errorInducingQueryParams: IRendering = {
        dateOrder: "abc" as SortDirection,
      };
      const token = await appTestUtils.getToken();

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
