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

import {
  getDumbApp,
  getUrlWithReplacedId,
} from "../services/test-utils.service";
import { PhotoController } from "./photo.controller";

describe("photo controller", () => {
  let photoController: PhotoController;

  let imageDb: IPhotoImageDb;
  let metadataDb: IPhotoMetadataDb;

  let useCases: IUseCases;
  let validators: IValidators;
  let parsers: IParsers;

  let dumbApp: Express;
  let req: TestAgent;
  let res$: Promise<Response>;

  const _id = "1684a61d-de2f-43c0-a83b-6f8981a31e0b";
  const photo = dumbPhotoGenerator.generate({ _id });

  beforeEach(() => {
    imageDb = new FakePhotoImageDb();
    metadataDb = new FakePhotoMetadataDb();

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
    dumbApp = getDumbApp();
    req = request(dumbApp);
  });

  describe("getPhotoMetadataHandler", () => {
    beforeEach(() => {
      const entryPoint = entryPoints.get(EntryPointId.GetPhotoMetadata);
      const path = entryPoint.getFullPath();
      const url = getUrlWithReplacedId(_id, EntryPointId.GetPhotoMetadata);
      dumbApp.get(path, photoController.getPhotoMetadataHandler);
      res$ = req.get(url);
    });

    it("should call the get-photo use case with the appropriate arguments", async () => {
      const executeSpy = jest.spyOn(useCases.getPhoto, "execute");

      await res$;

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith(_id, {
        fields: [GetPhotoField.Metadata],
      });
      expect.assertions(2);
    });

    it("should respond with status 200 and have a header property 'Content-Type: application/json'", async () => {
      const response = await res$;

      const contentTypeHeader = response.get("Content-Type");
      expect(contentTypeHeader).toContain("application/json");
      expect(response.statusCode).toBe(200);
      expect.assertions(2);
    });
  });

  describe("getPhotoImageHandler", () => {
    let executeSpy: jest.SpyInstance;

    beforeEach(() => {
      executeSpy = jest.spyOn(useCases.getPhoto, "execute");
      executeSpy.mockResolvedValueOnce(photo);

      const entryPoint = entryPoints.get(EntryPointId.GetPhotoImage);
      const path = entryPoint.getFullPath();
      const url = getUrlWithReplacedId(_id, EntryPointId.GetPhotoImage);
      dumbApp.get(path, photoController.getPhotoImageHandler);
      res$ = req.get(url);
    });

    it("should call the get-photo use case with the appropriate arguments", async () => {
      await res$;

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith(_id, {
        fields: [GetPhotoField.ImageBuffer],
      });
      expect.assertions(2);
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
    const path = entryPoint.getFullPath();
    const searchOptions: ISearchPhotoOptions = {
      rendering: { size: 10 },
      excludeImages: true,
    };

    beforeEach(() => {
      searchPhotoUseCaseSpy = jest.spyOn(useCases.searchPhoto, "execute");
      dumbApp.get(path, photoController.search);

      const queryParams = {
        excludeImages: searchOptions.excludeImages,
        ...searchOptions.rendering,
      };
      res$ = req.get(path).query(queryParams);
    });

    it("should call the search-photo use case with the parsed query params", async () => {
      await res$;

      expect(searchPhotoUseCaseSpy).toHaveBeenCalledTimes(1);
      expect(searchPhotoUseCaseSpy).toHaveBeenLastCalledWith(searchOptions);
      expect.assertions(2);
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
