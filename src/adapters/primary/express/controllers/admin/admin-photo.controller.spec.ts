import { Express } from "express";
import request from "supertest";
import TestAgent from "supertest/lib/agent";

import {
  AdminPhotoController,
  ControllersTestUtils,
  FakePhotoImageDb,
  FakePhotoMetadataDb,
  FakeValidatorsFactory,
  ParsersFactory,
  dumbPhotoGenerator,
} from "@adapters";
import {
  IPhotoImageDb,
  IPhotoMetadataDb,
  IUseCases,
  UseCasesFactory,
} from "@business-logic";
import { EntryPointId, IParsers, IValidators, entryPoints } from "@http-server";

describe("adminPhotoController", () => {
  let adminPhotoController: AdminPhotoController;
  let testUtils: ControllersTestUtils;

  let imageDb: IPhotoImageDb;
  let metadataDb: IPhotoMetadataDb;

  let useCases: IUseCases;
  let validators: IValidators;
  let parsers: IParsers;

  let dumbApp: Express;
  let req: TestAgent;

  const _id = "1684a61d-de2f-43c0-a83b-6f8981a31e0c";
  const photo = dumbPhotoGenerator.generatePhoto({ _id });

  beforeEach(() => {
    imageDb = new FakePhotoImageDb();
    metadataDb = new FakePhotoMetadataDb();

    testUtils = new ControllersTestUtils();

    useCases = new UseCasesFactory(metadataDb, imageDb).create();
    validators = new FakeValidatorsFactory().create();
    parsers = new ParsersFactory().create();

    adminPhotoController = new AdminPhotoController(
      useCases,
      validators,
      parsers,
    );
    dumbApp = testUtils.generateDumbApp();
    req = request(dumbApp);
  });

  describe("addPhotoHandler", () => {
    const entryPoint = entryPoints.get(EntryPointId.AddPhoto);
    const path = entryPoint.getRelativePath();
    beforeEach(() => {
      dumbApp.post(path, adminPhotoController.addPhotoHandler);
    });

    it("should call the add-photo use case with the appropriate arguments and respond with status 200", async () => {
      const executeSpy = jest.spyOn(useCases.addPhoto, "execute");

      const payload = testUtils.getPayloadFromPhoto(photo);
      const response = await req.post(path).send(payload);

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenLastCalledWith(photo);
      expect(response.statusCode).toBe(200);
      expect.assertions(3);
    });
  });

  describe("replacePhotoHandler", () => {
    const entryPoint = entryPoints.get(EntryPointId.ReplacePhoto);
    const path = entryPoint.getRelativePath();
    beforeEach(() => {
      dumbApp.put(path, adminPhotoController.replacePhotoHandler);
    });

    it("should call the replace-photo use case with the appropriate arguments and respond with status 200", async () => {
      const initPhoto = dumbPhotoGenerator.generatePhoto({ _id });
      await imageDb.insert(initPhoto);
      const executeSpy = jest.spyOn(useCases.replacePhoto, "execute");

      const payload = testUtils.getPayloadFromPhoto(photo);
      const response = await req.put(path).send(payload);

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenLastCalledWith(photo);
      expect(response.statusCode).toBe(200);
      expect.assertions(3);
    });
  });

  describe("deletePhotoHandler", () => {
    const entryPoint = entryPoints.get(EntryPointId.DeletePhoto);
    const path = entryPoint.getFullPathRaw();
    const url = entryPoint.getFullPathWithParams({ id: photo._id });
    beforeEach(() => {
      dumbApp.delete(path, adminPhotoController.deletePhotoHandler);
    });

    it("should call the delete-photo use case with the appropriate arguments and respond with status 200", async () => {
      const executeSpy = jest.spyOn(useCases.deletePhoto, "execute");

      const response = await req.delete(url);

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenLastCalledWith(_id);
      expect(response.statusCode).toBe(200);
      expect.assertions(3);
    });
  });
});
