import {
  IAddPhotoParams,
  IDeletePhotoParams,
  IGetPhotoParams,
  IPhoto,
  IPhotoDataDb,
  IPhotoImageDb,
  IPhotoStoredData,
  IReplacePhotoParams,
  ISearchPhotoOptions,
  ISearchPhotoParams,
  Photo,
  comparePhotoDates,
  fromAddPhotoParamsToPhotoStoredData,
} from "#photo-context";
import { HttpErrorCode, ISearchResult, SortDirection } from "#shared/models";
import {
  IPhotoDbTestUtils,
  IPhotoExpectsTestUtils,
  PhotoDbE2ETestUtils,
  PhotoExpectsTestUtils,
  TagTestUtils,
  parseTagDates,
} from "#shared/test-utils";
import {
  ISearchTagFilter,
  ISearchTagOptions,
  ITag,
  ITagDb,
  TagEntryPointId,
} from "#tag-context";
import { type Express } from "express";
import { clone, omit } from "ramda";
import request from "supertest";

import { ExpressAppServer } from "../app-server";
import {
  addPhotoPath,
  addTagPath,
  deletePhotoPath,
  deleteTagPath,
  getPhotoDataPath,
  getTagPath,
  replacePhotoPath,
  replaceTagPath,
  searchPhotoPath,
  searchTagPath,
  tagEntryPoints,
} from "./test-utils";
import { AppServerTestUtils } from "./test-utils/app-server.e2e-test-utils";

describe("ExpressAppServer", () => {
  const appTestUtils = new AppServerTestUtils(global);
  let photoDbTestUtils: IPhotoDbTestUtils;
  let tagTestUtils: TagTestUtils;

  let expressHttpServer: ExpressAppServer;
  let app: Express;

  let tagDb: ITagDb;
  let photoDataDb: IPhotoDataDb;
  let photoImageDb: IPhotoImageDb;

  const excludeManifestCheck = true;

  beforeEach(async () => {
    await appTestUtils.globalBeforeEach();
    expressHttpServer = appTestUtils.getServer();
    app = expressHttpServer.app;

    photoDataDb = appTestUtils.getPhotoDataDb();
    photoImageDb = appTestUtils.getPhotoImageDb();
    tagDb = appTestUtils.getTagDb();

    tagTestUtils = new TagTestUtils(tagDb);
    photoDbTestUtils = new PhotoDbE2ETestUtils(
      photoDataDb,
      photoImageDb,
      tagDb,
    );

    const allTags = await tagDb.find(undefined, { size: 1000 });
    await tagTestUtils.deleteTagsFromDb(allTags.hits);

    const allPhotos = await photoDataDb.find({ rendering: { size: 1000 } });
    await photoDbTestUtils.deletePhotos(allPhotos.hits.map((p) => p._id));
  }, 10000);

  afterEach(async () => {
    await appTestUtils.globalAfterEach();
  });

  afterAll(async () => {
    await appTestUtils.globalAfterAll();
  });

  describe("tag requests", () => {
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
            tagTestUtils.expectTagToBeInDb(tagToAdd, excludeManifestCheck);
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
            tagTestUtils.expectTagToBeInDb(newTag, excludeManifestCheck);
            expect.assertions(2);
          });
        });

        describe("when the requested tag already exists in db", () => {
          let tagToReplace: ITag;

          beforeEach(async () => {
            tagToReplace = { _id: newTag._id, name: "tag in db" };
            await tagTestUtils.insertTagInDb(tagToReplace);
          });

          it(`should replace the existing tag with the requested one in tags db`, async () => {
            const response = await request(app)
              .put(replaceTagPath)
              .send(newTag)
              .auth(token, { type: "bearer" });

            expect(response.statusCode).toBe(200);
            await tagTestUtils.expectTagToBeInDb(newTag, excludeManifestCheck);
            expect.assertions(2);
          });

          describe("when the tag was stored in photos", () => {
            let photoWithTagToReplace: IPhoto;

            beforeEach(async () => {
              photoWithTagToReplace = new Photo(
                "bf8240bd-45b2-43f9-86a2-0b41b97d7ffc",
                { imageBuffer: Buffer.from("the image") },
              );
              const addPhotoParams: IAddPhotoParams = {
                ...photoWithTagToReplace,
                tagIds: [tagToReplace._id],
              };
              await photoDbTestUtils.addPhoto(addPhotoParams);
            });

            afterEach(async () => {
              await photoDbTestUtils.deletePhoto(photoWithTagToReplace._id);
            });

            it("should replace the tag in the photos db", async () => {
              const photoStoredDataBeforeTagReplace =
                await photoDbTestUtils.getPhotoStoredData(
                  photoWithTagToReplace._id,
                );
              const tagInPhotoBefore: ITag =
                photoStoredDataBeforeTagReplace.tags[0];

              const response = await request(app)
                .put(replaceTagPath)
                .send(newTag)
                .auth(token, { type: "bearer" });

              expect(response.statusCode).toBe(200);
              const photoStoredDataAfterTagReplace =
                await photoDbTestUtils.getPhotoStoredData(
                  photoWithTagToReplace._id,
                );
              const tagInPhotoAfter = photoStoredDataAfterTagReplace.tags[0];
              expect(omit(["manifest"], tagInPhotoAfter)).toEqual(newTag);
              expect(tagInPhotoAfter.manifest.creation).toEqual(
                tagInPhotoBefore.manifest.creation,
              );
              expect(tagInPhotoAfter.manifest.lastUpdate).not.toEqual(
                tagInPhotoBefore.manifest.lastUpdate,
              );

              expect.assertions(4);
            });
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
          parseTagDates(tagResponse);

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

          const expectedSearchResult: ISearchResult<ITag> = {
            hits: dbTags,
            totalCount: dbTags.length,
          };
          const searchResult: ISearchResult<ITag> = response.body;
          searchResult.hits.forEach((t) => parseTagDates(t));

          tagTestUtils.expectSearchResultToBe(
            expectedSearchResult,
            searchResult,
          );
        });
      });

      describe("when there is a filter", () => {
        const filter: ISearchTagFilter = { name: "hello" };

        it("should return the tags matching the filter", async () => {
          const expectedTags: ITag[] = [dbTags[0]];
          const expectedSearchResult: ISearchResult<ITag> = {
            hits: expectedTags,
            totalCount: expectedTags.length,
          };

          const response = await request(app).get(searchTagPath).query(filter);
          const searchResult = response.body as ISearchResult<ITag>;
          searchResult.hits.forEach((t) => parseTagDates(t));

          tagTestUtils.expectSearchResultToBe(
            expectedSearchResult,
            searchResult,
          );
        });
      });

      describe("when options are requested", () => {
        let options: ISearchTagOptions = {};

        describe('when the "size" option is requested', () => {
          const expectedSize: ISearchTagOptions["size"] = 2;

          beforeEach(() => {
            options.size = expectedSize;
          });

          it("should return a number of tags with at most the requested size", async () => {
            const response = await request(app)
              .get(searchTagPath)
              .query(options);
            const searchResult = response.body as ISearchResult<ITag>;

            expect(searchResult.hits.length).toBeLessThanOrEqual(expectedSize);
            expect.assertions(1);
          });
        });

        describe('when the "from" option is requested', () => {
          const from: ISearchTagOptions["from"] = 2;
          let expectedFirstResult: ITag;

          beforeEach(() => {
            options.from = from;

            expectedFirstResult = dbTags[from - 1];
          });

          it('should return results starting from the requested "from"', async () => {
            const response = await request(app)
              .get(searchTagPath)
              .query(options);
            const searchResult = response.body as ISearchResult<ITag>;

            const firstResult = searchResult.hits[0];
            parseTagDates(firstResult);
            expect(firstResult).toEqual(expectedFirstResult);
            expect.assertions(1);
          });
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

        describe("when the tag was stored in photos", () => {
          let photoWithTagToDelete: IPhoto;
          const dumbTag: ITag = { _id: "dumb tag id" };

          beforeEach(async () => {
            await tagDb.insert(dumbTag);

            photoWithTagToDelete = new Photo(
              "7d265e53-7c29-419a-8fd5-3df2bab72446",
              { imageBuffer: Buffer.from("the image buffer") },
            );
            const addPhotoParams: IAddPhotoParams = {
              ...photoWithTagToDelete,
              tagIds: [tagToDelete._id, dumbTag._id],
            };
            await photoDbTestUtils.addPhoto(addPhotoParams);
          });

          afterEach(async () => {
            await photoDbTestUtils.deletePhoto(photoWithTagToDelete._id);
            await tagDb.delete(dumbTag._id);
          });

          it("should delete the tag in the photos db", async () => {
            const expectedPhotoStoredData: IPhotoStoredData = {
              ...omit(["imageBuffer"], photoWithTagToDelete),
              tags: [dumbTag],
              imageUrl: appTestUtils.getExpectedImageUrl(
                photoWithTagToDelete._id,
              ),
            };

            const response = await request(app)
              .delete(url)
              .auth(token, { type: "bearer" });
            const photoAfterTagDelete =
              await photoDbTestUtils.getPhotoStoredData(
                photoWithTagToDelete._id,
              );

            expect(response.statusCode).toBe(200);
            expect(omit(["manifest"], photoAfterTagDelete)).toEqual(
              expectedPhotoStoredData,
            );
            expect.assertions(2);
          });
        });
      });
    });
  });

  describe("photo requests", () => {
    let photoExpectsTestUtils: IPhotoExpectsTestUtils;

    beforeEach(() => {
      photoExpectsTestUtils = new PhotoExpectsTestUtils(photoDbTestUtils);
    });

    describe(`POST ${addPhotoPath}`, () => {
      let addPhotoParams: IAddPhotoParams;

      beforeEach(async () => {
        addPhotoParams = new Photo("101ab815-1045-43c5-8108-81e65d1678e0", {
          imageBuffer: Buffer.from("dumb buffer"),
        });
      });

      afterEach(async () => {
        await photoDbTestUtils.deletePhoto(addPhotoParams._id);
      });

      describe("when the requester does not have the expected right", () => {
        it(`should respond with status code ${HttpErrorCode.Unauthorized} (unauthorized)`, async () => {
          const response = await appTestUtils.sendAddPhotoReq({
            addPhotoParams,
            withToken: false,
          });

          expect(response.statusCode).toBe(HttpErrorCode.Unauthorized);
          expect.assertions(1);
        });
      });

      describe("when the requester has the expected right", () => {
        describe("when there is no image to upload", () => {
          beforeEach(async () => {
            const photoWithoutImage = new Photo(
              "bf326efd-f81e-4865-ba38-be3d4eecfb22",
            );
            addPhotoParams = photoWithoutImage;
          });

          it(`should respond with status code ${HttpErrorCode.BadRequest} (bad request)`, async () => {
            const expectedStatus = HttpErrorCode.BadRequest;

            const response = await appTestUtils.sendAddPhotoReq({
              addPhotoParams,
              withToken: true,
            });

            expect(response.statusCode).toBe(expectedStatus);
            expect.assertions(1);
          });

          it(`should not upload anything to the photo-data db`, async () => {
            await appTestUtils.sendAddPhotoReq({
              addPhotoParams,
              withToken: true,
            });

            const expectedPhotoStoredData = undefined;
            await photoExpectsTestUtils.expectPhotoStoredDataToBe(
              addPhotoParams._id,
              expectedPhotoStoredData,
              excludeManifestCheck,
            );
            photoExpectsTestUtils.checkAssertions();
          });
        });

        describe("when there is an image to upload", () => {
          let tags: ITag[];

          beforeEach(async () => {
            tags = [
              { _id: appTestUtils.generateId(), name: "tag1" },
              { _id: appTestUtils.generateId(), name: "tag2" },
            ];
            await tagTestUtils.insertTagsInDb(tags);

            const photo = new Photo("1d439ae2-12a1-4ca2-bf1a-986f97bc74b5", {
              imageBuffer: Buffer.from("toto"),
              photoData: {
                metadata: { description: "this is the description" },
              },
            });

            addPhotoParams = { ...photo, tagIds: tags.map((t) => t._id) };
          });

          afterEach(async () => {
            await tagTestUtils.deleteTagsFromDb(tags);
            await photoDbTestUtils.deletePhoto(addPhotoParams._id);
          });

          it("should upload the image to the photo-image db", async () => {
            await appTestUtils.sendAddPhotoReq({
              addPhotoParams,
              withToken: true,
            });

            await photoExpectsTestUtils.expectPhotoImageToBe(
              addPhotoParams._id,
              addPhotoParams.imageBuffer,
            );
            photoExpectsTestUtils.checkAssertions();
          });

          it("should upload the data (other than image) to the photo-data db", async () => {
            const expectedStoredData: IPhotoStoredData = {
              _id: addPhotoParams._id,
              metadata: addPhotoParams.metadata,
              tags,
              imageUrl: appTestUtils.getExpectedImageUrl(addPhotoParams._id),
            };

            await appTestUtils.sendAddPhotoReq({
              addPhotoParams,
              withToken: true,
            });

            await photoExpectsTestUtils.expectPhotoStoredDataToBe(
              addPhotoParams._id,
              expectedStoredData,
              excludeManifestCheck,
            );
            photoExpectsTestUtils.checkAssertions();
          });
        });
      });
    });

    describe(`GET ${getPhotoDataPath}`, () => {
      let getPhotoParams: IGetPhotoParams;

      describe("when the required photo does not exist in photo-data db", () => {
        beforeEach(async () => {
          const idNotInDb = appTestUtils.generateId();
          getPhotoParams = idNotInDb;
        });

        it(`should throw an error with status code ${HttpErrorCode.NotFound} (not found)`, async () => {
          const expectedStatus = HttpErrorCode.NotFound;

          const response =
            await appTestUtils.sendGetPhotoDataReq(getPhotoParams);

          expect(response.statusCode).toBe(expectedStatus);
          expect.assertions(1);
        });
      });

      describe("when the required photo exists in photo-data db", () => {
        let photoToGet: IPhoto;

        let tags: ITag[];

        beforeEach(async () => {
          tags = [
            { _id: appTestUtils.generateId(), name: "tag1" },
            { _id: appTestUtils.generateId(), name: "tag2" },
          ];
          await tagTestUtils.insertTagsInDb(tags);

          photoToGet = new Photo("b7c06fbe-b67f-4719-843b-d8743f9c9459", {
            imageBuffer: Buffer.from("some dumb data"),
          });
          photoToGet.tags = tags;

          const photoToGetAddPhotoParams: IAddPhotoParams = {
            ...omit(["tags"], photoToGet),
            tagIds: photoToGet.tags.map((t) => t._id),
          };
          await photoDbTestUtils.addPhoto(photoToGetAddPhotoParams);

          getPhotoParams = photoToGet._id;
        });

        afterEach(async () => {
          await photoDbTestUtils.deletePhoto(photoToGet._id);
          await tagTestUtils.deleteTagsFromDb(tags);
        });

        it(`should return the required photo data`, async () => {
          const expectedResult = omit(["imageBuffer"], photoToGet);

          const response =
            await appTestUtils.sendGetPhotoDataReq(getPhotoParams);

          const result = appTestUtils.getPhotoFromResponse(response);
          photoExpectsTestUtils.expectEqualPhotos(expectedResult, result);
          photoExpectsTestUtils.checkAssertions();
        });
      });
    });

    describe(`GET ${searchPhotoPath}`, () => {
      let storedPhotos: IPhoto[];
      let searchPhotoParams: ISearchPhotoParams;
      const timeout = 10000;

      beforeEach(async () => {
        storedPhotos = [
          new Photo("57dbdff5-ce22-4fb0-b922-5d1b539b92a3", {
            imageBuffer: Buffer.from("stored photo 1"),
            photoData: { metadata: { date: new Date("2005-09-07") } },
          }),
          new Photo("525292cb-4a2b-4da2-aa0c-b27cec3d222f", {
            imageBuffer: Buffer.from("stored photo 2"),
            photoData: { metadata: { date: new Date("1938-03-17") } },
          }),
          new Photo("00c7854f-bd76-49dc-9337-93a9e245e68f", {
            imageBuffer: Buffer.from("stored photo 3"),
            photoData: { metadata: { date: new Date("2018-01-31") } },
          }),
        ];
        await photoDbTestUtils.addPhotos(storedPhotos);
      }, timeout);

      afterEach(async () => {
        const storedPhotosIds = storedPhotos.map((p) => p._id);
        await photoDbTestUtils.deletePhotos(storedPhotosIds);

        searchPhotoParams = undefined;
      }, timeout);

      describe("when using the `tagId` filter", () => {
        let tag: ITag;
        let storedPhotosWithTag: IPhoto[];

        beforeEach(async () => {
          tag = {
            _id: appTestUtils.generateId(),
            name: "tag name",
          };
          await tagTestUtils.insertTagInDb(tag);

          storedPhotosWithTag = [
            new Photo("6b901f55-40eb-4866-a26b-27366020eda4", {
              imageBuffer: Buffer.from("photo 1"),
            }),
            new Photo("6ccedc35-a426-40f9-9b02-0d8f64c1ae7c", {
              imageBuffer: Buffer.from("photo 2"),
            }),
            new Photo("4ce2f762-1f3d-4e84-b0a3-bb8a8dba6c37", {
              imageBuffer: Buffer.from("photo 3"),
            }),
          ];
          storedPhotosWithTag.forEach((p) => {
            p.tags = [tag];
            p.imageUrl = appTestUtils.getExpectedImageUrl(p._id);
          });

          const addStoredPhotosWithTag$ = storedPhotosWithTag.map(
            async (photo) => {
              const addPhotoParams: IAddPhotoParams = {
                ...photo,
                tagIds: [tag._id],
              };
              await appTestUtils.addPhoto(addPhotoParams);
            },
          );
          await Promise.all(addStoredPhotosWithTag$);
          searchPhotoParams = { filter: { tagId: tag._id } };
        });

        afterEach(async () => {
          const ids = storedPhotosWithTag.map((p) => p._id);
          await photoDbTestUtils.deletePhotos(ids);
          await tagTestUtils.deleteTagFromDb(tag._id);
        });

        it("should return the photos whose tags include the required tag", async () => {
          const expectedSearchResult: ISearchResult<IPhoto> = {
            hits: storedPhotosWithTag.map((p) => omit(["imageBuffer"], p)),
            totalCount: storedPhotosWithTag.length,
          };

          const response =
            await appTestUtils.sendSearchPhotoReq(searchPhotoParams);
          const searchResult =
            appTestUtils.getPhotosFromSearchResponse(response);

          photoExpectsTestUtils.expectEqualSearchResults(
            expectedSearchResult,
            searchResult,
          );
          photoExpectsTestUtils.checkAssertions();
        });
      });

      describe("when using the `date` option", () => {
        it.each`
          case            | options
          ${"ascending"}  | ${{ dateOrder: SortDirection.Ascending }}
          ${"descending"} | ${{ dateOrder: SortDirection.Descending }}
        `(
          "should sort them by $case date when required",
          async ({ options }: { options: ISearchPhotoOptions }) => {
            const expectedOrder = options.dateOrder;
            searchPhotoParams = { options };

            const response =
              await appTestUtils.sendSearchPhotoReq(searchPhotoParams);
            const searchResult =
              appTestUtils.getPhotosFromSearchResponse(response);

            photoExpectsTestUtils.expectPhotosOrderToBe(
              searchResult.hits,
              expectedOrder,
            );
            photoExpectsTestUtils.checkAssertions();
          },
        );
      });

      describe("when using the `size` options", () => {
        it.each`
          options        | expectedSize
          ${{ size: 0 }} | ${0}
          ${{ size: 1 }} | ${1}
          ${{ size: 2 }} | ${2}
          ${{ size: 3 }} | ${3}
        `(
          "should return at most $expectedSize results when required",
          async ({ options, expectedSize }) => {
            searchPhotoParams = { options };

            const response =
              await appTestUtils.sendSearchPhotoReq(searchPhotoParams);
            const searchResult =
              appTestUtils.getPhotosFromSearchResponse(response);

            photoExpectsTestUtils.expectArraySizeToBeAtMost(
              searchResult.hits,
              expectedSize,
            );
            photoExpectsTestUtils.checkAssertions();
          },
        );
      });

      describe("when using the `from` option", () => {
        // using dateOrder to be sure the results are always ordered identically
        let orderedStoredPhotos: IPhoto[];

        beforeEach(() => {
          orderedStoredPhotos = clone(storedPhotos).sort(comparePhotoDates);
        });

        it.each`
          options                                            | expectedStartIndex
          ${{ from: 1, dateOrder: SortDirection.Ascending }} | ${0}
          ${{ from: 2, dateOrder: SortDirection.Ascending }} | ${1}
          ${{ from: 3, dateOrder: SortDirection.Ascending }} | ${2}
        `(
          "should return results starting from the $expectedStartIndex-th stored photo",
          async ({
            options,
            expectedStartIndex,
          }: {
            options: ISearchPhotoOptions;
            expectedStartIndex: number;
          }) => {
            searchPhotoParams = { options };

            const response =
              await appTestUtils.sendSearchPhotoReq(searchPhotoParams);
            const searchResult =
              appTestUtils.getPhotosFromSearchResponse(response);

            const expectedPhotos = orderedStoredPhotos.map((p) => {
              p = omit(["imageBuffer"], p);
              p.imageUrl = appTestUtils.getExpectedImageUrl(p._id);
              return p;
            });
            photoExpectsTestUtils.expectSubArrayToStartFromIndex(
              expectedPhotos,
              searchResult.hits,
              expectedStartIndex,
            );
            photoExpectsTestUtils.checkAssertions();
          },
        );
      });
    });

    describe(`PUT ${replacePhotoPath}`, () => {
      let storedPhoto: IPhoto;
      let replacePhotoParams: IReplacePhotoParams;

      describe("when the requester does not have the expected right", () => {
        beforeEach(() => {
          replacePhotoParams = {
            _id: appTestUtils.generateId(),
            imageBuffer: Buffer.from("required image buffer"),
          };
        });

        it(`should respond with status code ${HttpErrorCode.Unauthorized} (unauthorized)`, async () => {
          const expectedStatusCode = HttpErrorCode.Unauthorized;

          const response = await appTestUtils.sendReplacePhotoReq({
            replacePhotoParams,
            withToken: false,
          });

          expect(response.statusCode).toBe(expectedStatusCode);
          expect.assertions(1);
        });
      });

      describe("when the requester has the expected right", () => {
        describe("when there is no photo to replace", () => {
          beforeEach(async () => {
            replacePhotoParams = {
              _id: appTestUtils.generateId(),
              imageBuffer: Buffer.from("required image buffer"),
            };
          });

          it(`should respond with status code ${HttpErrorCode.NotFound} (not found)`, async () => {
            const expectedStatus = HttpErrorCode.NotFound;

            const response = await appTestUtils.sendReplacePhotoReq({
              replacePhotoParams,
              withToken: true,
            });

            expect(response.statusCode).toBe(expectedStatus);
          });
        });

        describe("when there is a photo to replace", () => {
          beforeEach(async () => {
            storedPhoto = new Photo("97b412ea-3efc-401d-a66c-71e71442ddd5", {
              imageBuffer: Buffer.from("dumb image buffer"),
            });
            await photoDbTestUtils.addPhoto(storedPhoto);

            replacePhotoParams = {
              _id: storedPhoto._id,
              imageBuffer: Buffer.from("required image buffer"),
            };
          });

          afterEach(async () => {
            await photoDbTestUtils.deletePhoto(storedPhoto._id);
          });

          describe("when there is no image in the new photo", () => {
            beforeEach(() => {
              replacePhotoParams = { _id: storedPhoto._id };
            });

            it(`should respond with status code ${HttpErrorCode.BadRequest} (bad request)`, async () => {
              const expectedStatus = HttpErrorCode.BadRequest;

              const response = await appTestUtils.sendReplacePhotoReq({
                replacePhotoParams,
                withToken: true,
              });

              expect(response.statusCode).toBe(expectedStatus);
              expect.assertions(1);
            });

            it("should not update the data in the photo-data db", async () => {
              const expectedStoreData = omit(["imageBuffer"], storedPhoto);
              expectedStoreData.imageUrl = appTestUtils.getExpectedImageUrl(
                storedPhoto._id,
              );

              await appTestUtils.sendReplacePhotoReq({
                replacePhotoParams,
                withToken: true,
              });

              await photoExpectsTestUtils.expectPhotoStoredDataToBe(
                storedPhoto._id,
                expectedStoreData,
                excludeManifestCheck,
              );
              photoExpectsTestUtils.checkAssertions();
            });
          });

          describe("when there is an image in the new photo", () => {
            let tags: ITag[];

            beforeEach(async () => {
              tags = [
                { _id: appTestUtils.generateId(), name: "tag1" },
                { _id: appTestUtils.generateId(), name: "tag2" },
              ];
              await tagTestUtils.insertTagsInDb(tags);

              const newPhoto = new Photo(storedPhoto._id, {
                imageBuffer: Buffer.from("dumb buffer"),
                photoData: { metadata: { description: "the description" } },
              });

              replacePhotoParams = {
                ...newPhoto,
                tagIds: tags.map((t) => t._id),
              };
            });

            afterEach(async () => {
              await tagTestUtils.deleteTagsFromDb(tags);
              await photoDbTestUtils.deletePhoto(replacePhotoParams._id);
            });

            it("should replace the photo image in the photo-image db", async () => {
              const expectedStoredPhotoImage = replacePhotoParams.imageBuffer;

              await appTestUtils.sendReplacePhotoReq({
                replacePhotoParams,
                withToken: true,
              });

              await photoExpectsTestUtils.expectPhotoImageToBe(
                replacePhotoParams._id,
                expectedStoredPhotoImage,
              );
              photoExpectsTestUtils.checkAssertions();
            });

            describe("when the photo to replace had data already stored in the photo-data db", () => {
              it("should replace the data with the new one in the photo-data db", async () => {
                const expectedStoredData =
                  await fromAddPhotoParamsToPhotoStoredData(
                    replacePhotoParams,
                    tagDb,
                  );
                expectedStoredData.imageUrl = appTestUtils.getExpectedImageUrl(
                  storedPhoto._id,
                );

                await appTestUtils.sendReplacePhotoReq({
                  replacePhotoParams,
                  withToken: true,
                });

                await photoExpectsTestUtils.expectPhotoStoredDataToBe(
                  replacePhotoParams._id,
                  expectedStoredData,
                  excludeManifestCheck,
                );
                photoExpectsTestUtils.checkAssertions();
              });
            });

            describe("when the photo to replace did not have any data stored in the photo-data db", () => {
              let photoWithoutDataToReplace: IPhoto;

              beforeEach(async () => {
                photoWithoutDataToReplace = new Photo(
                  "b6810e09-ff1a-4d48-8c5c-58ca98f70617",
                  { imageBuffer: Buffer.from("dumb image") },
                );

                await photoDbTestUtils.addPhoto(photoWithoutDataToReplace);

                const newPhoto = new Photo(photoWithoutDataToReplace._id, {
                  photoData: { metadata: { description: "tutu" } },
                  imageBuffer: Buffer.from("new image buffer"),
                });
                replacePhotoParams = {
                  ...newPhoto,
                  tagIds: tags.map((t) => t._id),
                };
              });

              afterEach(async () => {
                await photoDbTestUtils.deletePhoto(
                  photoWithoutDataToReplace._id,
                );
              });

              it("should add the new data in the photo-data db", async () => {
                const expectedStoredData =
                  await fromAddPhotoParamsToPhotoStoredData(
                    replacePhotoParams,
                    tagDb,
                  );
                expectedStoredData.imageUrl = appTestUtils.getExpectedImageUrl(
                  replacePhotoParams._id,
                );

                await appTestUtils.sendReplacePhotoReq({
                  replacePhotoParams,
                  withToken: true,
                });

                await photoExpectsTestUtils.expectPhotoStoredDataToBe(
                  replacePhotoParams._id,
                  expectedStoredData,
                  excludeManifestCheck,
                );
                photoExpectsTestUtils.checkAssertions();
              });
            });
          });
        });
      });
    });

    describe(`DELETE ${deletePhotoPath}`, () => {
      let deletePhotoParams: IDeletePhotoParams;

      describe("when the requester does not have the expected right", () => {
        beforeEach(() => {
          deletePhotoParams = appTestUtils.generateId();
        });

        it(`should respond with status code ${HttpErrorCode.Unauthorized} (unauthorized)`, async () => {
          const response = await appTestUtils.sendDeletePhotoReq({
            deletePhotoParams,
            withToken: false,
          });

          expect(response.statusCode).toBe(HttpErrorCode.Unauthorized);
          expect.assertions(1);
        });
      });

      describe("when the requester has the expected right", () => {
        let photoToDelete: IPhoto;

        beforeEach(async () => {
          photoToDelete = new Photo("888d5f64-9fa4-4db5-b97f-5a3b3e6d7931", {
            imageBuffer: Buffer.from("dumb buffer"),
            photoData: { metadata: { description: "toto" } },
          });
          await photoDbTestUtils.addPhoto(photoToDelete);

          deletePhotoParams = photoToDelete._id;
        });

        it("should delete photo's data (other than image) from the photo-data db", async () => {
          const expectedStoreData = undefined;

          await appTestUtils.sendDeletePhotoReq({
            deletePhotoParams,
            withToken: true,
          });

          await photoExpectsTestUtils.expectPhotoStoredDataToBe(
            deletePhotoParams,
            expectedStoreData,
            excludeManifestCheck,
          );
          photoExpectsTestUtils.checkAssertions();
        });

        it("should delete photo's image the photo-image db", async () => {
          const expectedStoredImage = undefined;

          await appTestUtils.sendDeletePhotoReq({
            deletePhotoParams,
            withToken: true,
          });

          await photoExpectsTestUtils.expectPhotoImageToBe(
            deletePhotoParams,
            expectedStoredImage,
          );
          photoExpectsTestUtils.checkAssertions();
        });

        describe("when the deletion of photo data (other than image) fails", () => {
          beforeEach(() => {
            const photoDataDb = appTestUtils.getPhotoDataDb();
            jest
              .spyOn(photoDataDb, "delete")
              .mockImplementationOnce(() =>
                Promise.reject(new Error("data-deletion failed")),
              );
          });

          afterEach(async () => {
            await photoDbTestUtils.deletePhoto(photoToDelete._id);
          });

          it(`should respond with status code ${HttpErrorCode.InternalServerError} (internal server error)`, async () => {
            const expectedStatusCode = HttpErrorCode.InternalServerError;

            const response = await appTestUtils.sendDeletePhotoReq({
              deletePhotoParams,
              withToken: true,
            });

            expect(response.statusCode).toBe(expectedStatusCode);
            expect.assertions(1);
          });

          it("should not delete the photo's image", async () => {
            const expectedStoredImage = photoToDelete.imageBuffer;

            await appTestUtils.sendDeletePhotoReq({
              deletePhotoParams,
              withToken: true,
            });

            await photoExpectsTestUtils.expectPhotoImageToBe(
              deletePhotoParams,
              expectedStoredImage,
            );
            photoExpectsTestUtils.checkAssertions();
          });
        });

        describe("when the deletion of photo image fails", () => {
          beforeEach(() => {
            const photoImageDb = appTestUtils.getPhotoImageDb();
            jest
              .spyOn(photoImageDb, "delete")
              .mockImplementationOnce(() =>
                Promise.reject(new Error("image-deletion failed")),
              );
          });

          afterEach(async () => {
            await photoDbTestUtils.deletePhoto(photoToDelete._id);
          });

          it(`should respond with status code ${HttpErrorCode.InternalServerError} (internal server error)`, async () => {
            const expectedStatusCode = HttpErrorCode.InternalServerError;

            const response = await appTestUtils.sendDeletePhotoReq({
              deletePhotoParams,
              withToken: true,
            });

            expect(response.statusCode).toBe(expectedStatusCode);
            expect.assertions(1);
          });

          it("should not delete photo's data in photo-data db", async () => {
            const expectedPhotoStoredData: IPhotoStoredData =
              await fromAddPhotoParamsToPhotoStoredData(photoToDelete, tagDb);
            expectedPhotoStoredData.imageUrl = appTestUtils.getExpectedImageUrl(
              photoToDelete._id,
            );

            await appTestUtils.sendDeletePhotoReq({
              deletePhotoParams,
              withToken: true,
            });

            await photoExpectsTestUtils.expectPhotoStoredDataToBe(
              deletePhotoParams,
              expectedPhotoStoredData,
              excludeManifestCheck,
            );
            photoExpectsTestUtils.checkAssertions();
          });
        });
      });
    });
  });
});
