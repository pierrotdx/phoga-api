import {
  IAddPhotoParams,
  IDeletePhotoParams,
  IGetPhotoParams,
  IPhoto,
  IPhotoStoredData,
  IReplacePhotoParams,
  ISearchPhotoParams,
  comparePhotoDates,
  dumbPhotoGenerator,
} from "#photo-context";
import { HttpErrorCode, IRendering, SortDirection } from "#shared/models";
import { PhotoTestUtils, TagTestUtils } from "#shared/test-utils";
import { ISearchTagFilter, ITag, TagEntryPointId } from "#tag-context";
import { type Express } from "express";
import { clone, omit, pick } from "ramda";
import request from "supertest";

import { ExpressAppServer } from "../app-server";
import {
  addPhotoPath,
  addTagPath,
  deletePhotoPath,
  deleteTagPath,
  getImagePath,
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

  let expressHttpServer: ExpressAppServer;
  let app: Express;

  beforeEach(async () => {
    await appTestUtils.globalBeforeEach();
    expressHttpServer = appTestUtils.getServer();
    app = expressHttpServer.app;
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
      let addPhotoParams: IAddPhotoParams;

      beforeEach(async () => {
        addPhotoParams = await dumbPhotoGenerator.generatePhoto();
      });

      afterEach(async () => {
        await photoTestUtils.deletePhotoFromDb(addPhotoParams._id);
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
            const photoWithoutImage = await dumbPhotoGenerator.generatePhoto();
            delete photoWithoutImage.imageBuffer;
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
            await photoTestUtils.expectPhotoStoredDataToBe(
              addPhotoParams._id,
              expectedPhotoStoredData,
            );
            photoTestUtils.checkAssertions();
          });
        });

        describe("when there is an image to upload", () => {
          beforeEach(async () => {
            addPhotoParams = await dumbPhotoGenerator.generatePhoto();
          });

          afterEach(async () => {
            await photoTestUtils.deletePhotoFromDb(addPhotoParams._id);
          });

          it("should upload the image to the photo-image db", async () => {
            await appTestUtils.sendAddPhotoReq({
              addPhotoParams,
              withToken: true,
            });

            await photoTestUtils.expectPhotoStoredImageToBe(
              addPhotoParams._id,
              addPhotoParams.imageBuffer,
            );
            photoTestUtils.checkAssertions();
          });

          it("should upload the data (other than image) to the photo-data db", async () => {
            const expectedStoredData: IPhotoStoredData = {
              _id: addPhotoParams._id,
              metadata: addPhotoParams.metadata,
            };

            await appTestUtils.sendAddPhotoReq({
              addPhotoParams,
              withToken: true,
            });

            await photoTestUtils.expectPhotoStoredDataToBe(
              addPhotoParams._id,
              expectedStoredData,
            );
            photoTestUtils.checkAssertions();
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

        beforeEach(async () => {
          photoToGet = await dumbPhotoGenerator.generatePhoto();
          await photoTestUtils.insertPhotoInDbs(photoToGet);

          getPhotoParams = photoToGet._id;
        });

        afterEach(async () => {
          await photoTestUtils.deletePhotoFromDb(photoToGet._id);
        });

        it(`should return the required photo data`, async () => {
          const expectedResult = omit(["imageBuffer"], photoToGet);

          const response =
            await appTestUtils.sendGetPhotoDataReq(getPhotoParams);

          const result = appTestUtils.getPhotoFromResponse(response);
          photoTestUtils.expectMatchingPhotos(expectedResult, result);
          photoTestUtils.checkAssertions();
        });
      });
    });

    describe(`GET ${getImagePath}`, () => {
      let getPhotoParams: IGetPhotoParams;

      describe("when the required photo does not have an image in db", () => {
        beforeEach(async () => {
          const idNotInDb = appTestUtils.generateId();
          getPhotoParams = idNotInDb;
        });

        it(`should throw an error with status code ${HttpErrorCode.NotFound} (not found)`, async () => {
          const expectedStatus = HttpErrorCode.NotFound;

          const response =
            await appTestUtils.sendGetPhotoImageReq(getPhotoParams);

          expect(response.statusCode).toBe(expectedStatus);
          expect.assertions(1);
        });
      });

      describe("when the required photo has an image in db", () => {
        let photoToGet: IPhoto;

        beforeEach(async () => {
          photoToGet = await dumbPhotoGenerator.generatePhoto();
          await photoTestUtils.insertPhotoInDbs(photoToGet);

          getPhotoParams = photoToGet._id;
        });

        afterEach(async () => {
          await photoTestUtils.deletePhotoFromDb(photoToGet._id);
        });

        it("should return the required photo image", async () => {
          const expectedResult = pick(["_id", "imageBuffer"], photoToGet);

          const response =
            await appTestUtils.sendGetPhotoImageReq(getPhotoParams);

          const responsePhoto = appTestUtils.getPhotoFromResponse(response);
          photoTestUtils.expectMatchingPhotos(expectedResult, responsePhoto);
        });
      });
    });

    describe(`GET ${searchPhotoPath}`, () => {
      let storedPhotos: IPhoto[];
      let searchPhotoParams: ISearchPhotoParams;
      const timeout = 10000;

      beforeEach(async () => {
        storedPhotos = await Promise.all([
          await dumbPhotoGenerator.generatePhoto(),
          await dumbPhotoGenerator.generatePhoto(),
          await dumbPhotoGenerator.generatePhoto(),
        ]);
        await photoTestUtils.insertPhotosInDbs(storedPhotos);
      }, timeout);

      afterEach(async () => {
        const storedPhotosIds = storedPhotos.map((p) => p._id);
        await photoTestUtils.deletePhotosFromDb(storedPhotosIds);

        searchPhotoParams = undefined;
      }, timeout);

      describe("when using the `rendering.date` option", () => {
        it.each`
          case            | rendering
          ${"ascending"}  | ${{ dateOrder: SortDirection.Ascending }}
          ${"descending"} | ${{ dateOrder: SortDirection.Descending }}
        `(
          "should sort them by $case date when required",
          async ({ rendering }: { rendering: IRendering }) => {
            const expectedOrder = rendering.dateOrder;
            searchPhotoParams = { rendering };

            const response =
              await appTestUtils.sendSearchPhotoReq(searchPhotoParams);
            const result = appTestUtils.getPhotosFromSearchResponse(response);

            photoTestUtils.expectPhotosOrderToBe(result, expectedOrder);
            photoTestUtils.checkAssertions();
          },
        );
      });

      describe("when using the `rendering.size` options", () => {
        it.each`
          rendering      | expectedSize
          ${{ size: 0 }} | ${0}
          ${{ size: 1 }} | ${1}
          ${{ size: 2 }} | ${2}
          ${{ size: 3 }} | ${3}
        `(
          "should return at most $expectedSize results when required",
          async ({ rendering, expectedSize }) => {
            searchPhotoParams = { rendering };

            const response =
              await appTestUtils.sendSearchPhotoReq(searchPhotoParams);
            const result = appTestUtils.getPhotosFromSearchResponse(response);

            photoTestUtils.expectArraySizeToBeAtMost(result, expectedSize);
            photoTestUtils.checkAssertions();
          },
        );
      });

      describe("when using the `rendering.from` option", () => {
        // using dateOrder to be sure the results are always ordered identically
        let orderedStoredPhotos: IPhoto[];

        beforeEach(() => {
          orderedStoredPhotos = clone(storedPhotos).sort(comparePhotoDates);
        });

        it.each`
          rendering                                          | expectedStartIndex
          ${{ from: 1, dateOrder: SortDirection.Ascending }} | ${0}
          ${{ from: 2, dateOrder: SortDirection.Ascending }} | ${1}
          ${{ from: 3, dateOrder: SortDirection.Ascending }} | ${2}
        `(
          "should return results starting from the $expectedStartIndex-th stored photo",
          async ({
            rendering,
            expectedStartIndex,
          }: {
            rendering: IRendering;
            expectedStartIndex: number;
          }) => {
            searchPhotoParams = { rendering };

            const response =
              await appTestUtils.sendSearchPhotoReq(searchPhotoParams);
            const result = appTestUtils.getPhotosFromSearchResponse(response);

            photoTestUtils.expectSubArrayToStartFromIndex(
              orderedStoredPhotos,
              result,
              expectedStartIndex,
            );
            photoTestUtils.checkAssertions();
          },
        );
      });

      describe("when using the `excludeImages` option", () => {
        it.each`
          case                | excludeImages
          ${"without images"} | ${true}
          ${"with images"}    | ${false}
        `(
          "should return photos $case when excludeImages is `$excludeImages`",
          async ({ excludeImages }: { excludeImages: boolean }) => {
            searchPhotoParams = { excludeImages };

            const expectedPhotos = clone(storedPhotos).map((p) =>
              excludeImages ? omit(["imageBuffer"], p) : p,
            );

            const response =
              await appTestUtils.sendSearchPhotoReq(searchPhotoParams);
            const result = appTestUtils.getPhotosFromSearchResponse(response);

            photoTestUtils.expectEqualPhotoArrays(result, expectedPhotos);
            photoTestUtils.checkAssertions();
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
            storedPhoto = await dumbPhotoGenerator.generatePhoto();
            await photoTestUtils.insertPhotoInDbs(storedPhoto);

            replacePhotoParams = {
              _id: storedPhoto._id,
              imageBuffer: Buffer.from("required image buffer"),
            };
          });

          afterEach(async () => {
            await photoTestUtils.deletePhotoFromDb(storedPhoto._id);
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

            it("should not update the data (other than image) in the photo-data db", async () => {
              const expectedStoreData =
                photoTestUtils.getPhotoStoredData(storedPhoto);

              await appTestUtils.sendReplacePhotoReq({
                replacePhotoParams,
                withToken: true,
              });

              await photoTestUtils.expectPhotoStoredDataToBe(
                storedPhoto._id,
                expectedStoreData,
              );
              photoTestUtils.checkAssertions();
            });
          });

          describe("when there is an image in the new photo", () => {
            beforeEach(async () => {
              const newPhoto = await dumbPhotoGenerator.generatePhoto({
                _id: storedPhoto._id,
              });
              replacePhotoParams = newPhoto;
            });

            it("should replace the photo image in the photo-image db", async () => {
              const expectedStoredPhotoImage = replacePhotoParams.imageBuffer;

              await appTestUtils.sendReplacePhotoReq({
                replacePhotoParams,
                withToken: true,
              });

              await photoTestUtils.expectPhotoStoredImageToBe(
                replacePhotoParams._id,
                expectedStoredPhotoImage,
              );
              photoTestUtils.checkAssertions();
            });

            describe("when the photo to replace had data already stored in the photo-data db", () => {
              it("should replace the data with the new one in the photo-data db", async () => {
                const expectedStoredData =
                  photoTestUtils.getPhotoStoredData(replacePhotoParams);

                await appTestUtils.sendReplacePhotoReq({
                  replacePhotoParams,
                  withToken: true,
                });

                await photoTestUtils.expectPhotoStoredDataToBe(
                  replacePhotoParams._id,
                  expectedStoredData,
                );
                photoTestUtils.checkAssertions();
              });
            });

            describe("when the photo to replace did non have any data stored in the photo-data db", () => {
              let photoWithoutDataToReplace: IPhoto;

              beforeEach(async () => {
                photoWithoutDataToReplace =
                  await dumbPhotoGenerator.generatePhoto();
                delete photoWithoutDataToReplace.metadata;

                await photoTestUtils.insertPhotoInDbs(
                  photoWithoutDataToReplace,
                );

                const newPhoto = await dumbPhotoGenerator.generatePhoto({
                  _id: photoWithoutDataToReplace._id,
                });
                replacePhotoParams = newPhoto;
              });

              afterEach(async () => {
                await photoTestUtils.deletePhotoFromDb(
                  photoWithoutDataToReplace._id,
                );
              });

              it("should add the new data in the photo-data db", async () => {
                const expectedStoredData =
                  photoTestUtils.getPhotoStoredData(replacePhotoParams);

                await appTestUtils.sendReplacePhotoReq({
                  replacePhotoParams,
                  withToken: true,
                });

                await photoTestUtils.expectPhotoStoredDataToBe(
                  replacePhotoParams._id,
                  expectedStoredData,
                );
                photoTestUtils.checkAssertions();
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
          photoToDelete = await dumbPhotoGenerator.generatePhoto();
          await photoTestUtils.insertPhotoInDbs(photoToDelete);

          deletePhotoParams = photoToDelete._id;
        });

        afterEach(async () => {
          // in case a test fails
          await photoTestUtils.deletePhotoFromDb(photoToDelete._id);
        });

        it("should delete photo\'s data (other than image) from the photo-data db", async () => {
          const expectedStoreData = undefined;

          await appTestUtils.sendDeletePhotoReq({
            deletePhotoParams,
            withToken: true,
          });

          await photoTestUtils.expectPhotoStoredDataToBe(
            deletePhotoParams,
            expectedStoreData,
          );
          photoTestUtils.checkAssertions();
        });

        it("should delete photo's image the photo-image db", async () => {
          const expectedStoredImage = undefined;

          await appTestUtils.sendDeletePhotoReq({
            deletePhotoParams,
            withToken: true,
          });

          await photoTestUtils.expectPhotoStoredImageToBe(
            deletePhotoParams,
            expectedStoredImage,
          );
          photoTestUtils.checkAssertions();
        });

        describe("when the deletion of photo data (other than image) fails", () => {
          beforeEach(() => {
            const photoDataDb = appTestUtils.getPhotoDataDb();
            jest
              .spyOn(photoDataDb, "delete")
              .mockImplementationOnce(() =>
                Promise.reject("data-deletion failed"),
              );
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

            await photoTestUtils.expectPhotoStoredImageToBe(
              deletePhotoParams,
              expectedStoredImage,
            );
            photoTestUtils.checkAssertions();
          });
        });

        describe("when the deletion of photo image fails", () => {
          beforeEach(() => {
            const photoImageDb = appTestUtils.getPhotoImageDb();
            jest
              .spyOn(photoImageDb, "delete")
              .mockImplementationOnce(() =>
                Promise.reject("image-deletion failed"),
              );
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
              photoTestUtils.getPhotoStoredData(photoToDelete);

            await appTestUtils.sendDeletePhotoReq({
              deletePhotoParams,
              withToken: true,
            });

            await photoTestUtils.expectPhotoStoredDataToBe(
              deletePhotoParams,
              expectedPhotoStoredData,
            );
            photoTestUtils.checkAssertions();
          });
        });
      });
    });
  });
});
