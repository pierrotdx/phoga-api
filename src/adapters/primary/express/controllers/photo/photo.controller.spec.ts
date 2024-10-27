import { type Express } from "express";
import request, { Response } from "supertest";
import TestAgent from "supertest/lib/agent";

import {
  AddPhotoFakeValidator,
  AddPhotoParser,
  DeletePhotoFakeValidator,
  FakePhotoImageDb,
  FakePhotoMetadataDb,
  GetPhotoFakeValidator,
  GetPhotoParser,
  ReplacePhotoFakeValidator,
  SearchPhotoFakeValidator,
  SearchPhotoParser,
  dumbPhotoGenerator,
} from "@adapters";
import {
  AddPhoto,
  DeletePhoto,
  GetPhoto,
  GetPhotoField,
  IPhotoImageDb,
  IPhotoMetadataDb,
  ISearchPhotoOptions,
  IUseCases,
  ReplacePhoto,
  SearchPhoto,
} from "@business-logic";
import { EntryPointId, IParsers, IValidators, entryPoints } from "@http-server";
import { AssertionsCounter, IAssertionsCounter, sharedTestUtils } from "@utils";

import { ControllersTestUtils } from "../controllers.test-utils";
import { PhotoController } from "./photo.controller";

describe(`${PhotoController.name}`, () => {
  let photoController: PhotoController;
  let testUtils: ControllersTestUtils;
  let assertionsCounter: IAssertionsCounter;

  let imageDb: IPhotoImageDb;
  let metadataDb: IPhotoMetadataDb;

  let useCases: IUseCases;
  let validators: IValidators;
  let parsers: IParsers;

  let app: Express;
  let req: TestAgent;
  let res$: Promise<Response>;

  const id = "1684a61d-de2f-43c0-a83b-6f8981a31e0b";
  const photo = dumbPhotoGenerator.generatePhoto({ _id: id });

  beforeEach(() => {
    imageDb = new FakePhotoImageDb();
    metadataDb = new FakePhotoMetadataDb();

    testUtils = new ControllersTestUtils();
    assertionsCounter = new AssertionsCounter();

    useCases = {
      getPhoto: new GetPhoto(metadataDb, imageDb),
      addPhoto: new AddPhoto(metadataDb, imageDb),
      replacePhoto: new ReplacePhoto(metadataDb, imageDb),
      deletePhoto: new DeletePhoto(metadataDb, imageDb),
      searchPhoto: new SearchPhoto(metadataDb, imageDb),
    };

    validators = {
      getPhoto: new GetPhotoFakeValidator(),
      addPhoto: new AddPhotoFakeValidator(),
      replacePhoto: new ReplacePhotoFakeValidator(),
      deletePhoto: new DeletePhotoFakeValidator(),
      searchPhoto: new SearchPhotoFakeValidator(),
    };

    parsers = {
      getPhoto: new GetPhotoParser(),
      addPhoto: new AddPhotoParser(),
      replacePhoto: new AddPhotoParser(),
      deletePhoto: new GetPhotoParser(),
      searchPhoto: new SearchPhotoParser(),
    };

    photoController = new PhotoController(useCases, validators, parsers);
    app = testUtils.generateDumbApp();
    req = request(app);
  });

  describe("getMetadata", () => {
    beforeEach(() => {
      const entryPoint = entryPoints.get(EntryPointId.GetPhotoMetadata);
      const path = entryPoint.getFullPathRaw();
      app.get(path, photoController.getMetadata);
      const url = entryPoint.getFullPathWithParams({ id });
      res$ = req.get(url);
    });

    it("should call the get-photo use case with the appropriate arguments", async () => {
      const executeSpy = jest.spyOn(useCases.getPhoto, "execute");
      await res$;
      const expectedParams = [
        id,
        {
          fields: [GetPhotoField.Metadata],
        },
      ];
      sharedTestUtils.expectFunctionToBeCalledWith(
        executeSpy,
        expectedParams,
        assertionsCounter,
      );
      assertionsCounter.checkAssertions();
    });

    it("should respond with status 200 and have a header property 'Content-Type: application/json'", async () => {
      const response = await res$;

      const contentTypeHeader = response.get("Content-Type");
      expect(contentTypeHeader).toContain("application/json");
      expect(response.statusCode).toBe(200);
      expect.assertions(2);
    });
  });

  describe("getImage", () => {
    let executeSpy: jest.SpyInstance;

    beforeEach(() => {
      executeSpy = jest.spyOn(useCases.getPhoto, "execute");
      executeSpy.mockResolvedValueOnce(photo);
      const entryPoint = entryPoints.get(EntryPointId.GetPhotoImage);
      const path = entryPoint.getFullPathRaw();
      app.get(path, photoController.getImage);
      const url = entryPoint.getFullPathWithParams({ id });
      res$ = req.get(url);
    });

    it("should call the get-photo use case with the appropriate arguments", async () => {
      await res$;
      const expectedParams = [
        id,
        {
          fields: [GetPhotoField.ImageBuffer],
        },
      ];
      sharedTestUtils.expectFunctionToBeCalledWith(
        executeSpy,
        expectedParams,
        assertionsCounter,
      );
    });

    it("should respond with status 200 and have a header property 'Content-Type: image/jpeg'", async () => {
      const response = await res$;
      const contentTypeHeader = response.get("Content-Type");
      expect(contentTypeHeader).toContain("image/jpeg");
      expect(response.statusCode).toBe(200);
      expect.assertions(2);
    });
  });

  describe("search", () => {
    let searchPhotoUseCaseSpy: jest.SpyInstance;
    const entryPoint = entryPoints.get(EntryPointId.SearchPhoto);
    const path = entryPoint.getFullPathRaw();
    const searchOptions: ISearchPhotoOptions = {
      rendering: { size: 10 },
      excludeImages: true,
    };

    beforeEach(() => {
      searchPhotoUseCaseSpy = jest.spyOn(useCases.searchPhoto, "execute");
      app.get(path, photoController.search);

      const queryParams = {
        excludeImages: searchOptions.excludeImages,
        ...searchOptions.rendering,
      };
      res$ = req.get(path).query(queryParams);
    });

    it("should call the search-photo use case with the parsed query params", async () => {
      await res$;

      sharedTestUtils.expectFunctionToBeCalledWith(
        searchPhotoUseCaseSpy,
        [searchOptions],
        assertionsCounter,
      );
    });

    it("should respond with status 200 and have a header property 'Content-Type: application/json'", async () => {
      const response = await res$;

      const contentTypeHeader = response.get("Content-Type");
      expect(contentTypeHeader).toContain("application/json");
      expect(response.statusCode).toBe(200);
      expect.assertions(2);
    });
  });
});
