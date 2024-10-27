import { type Express } from "express";
import request, { Response } from "supertest";
import TestAgent from "supertest/lib/agent";

import {
  FakePhotoImageDb,
  FakePhotoMetadataDb,
  FakeValidatorsFactory,
  ParsersFactory,
  dumbPhotoGenerator,
} from "@adapters";
import {
  GetPhotoField,
  IPhotoImageDb,
  IPhotoMetadataDb,
  ISearchPhotoOptions,
  IUseCases,
  UseCasesFactory,
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

    useCases = new UseCasesFactory(metadataDb, imageDb).create();
    validators = new FakeValidatorsFactory().create();
    parsers = new ParsersFactory().create();

    photoController = new PhotoController(useCases, validators, parsers);
    testUtils = new ControllersTestUtils();
    assertionsCounter = new AssertionsCounter();
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
        assertionsCounter,
        executeSpy,
        ...expectedParams,
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
        assertionsCounter,
        executeSpy,
        ...expectedParams,
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
        assertionsCounter,
        searchPhotoUseCaseSpy,
        searchOptions,
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
