import { Express } from "express";
import request from "supertest";
import TestAgent from "supertest/lib/agent";

import { FakePhotoImageDb, FakePhotoMetadataDb, IUseCases } from "@domain";
import { AdminPhotoController, EntryPointId, entryPoints } from "@http-server";
import {
  AssertionsCounter,
  IAssertionsCounter,
  dumbPhotoGenerator,
  sharedTestUtils,
} from "@shared";

import { AdminPhotoControllerTestUtils } from "./admin-photo.controller.test-utils";

describe("adminPhotoController", () => {
  const photoMetadataDb = new FakePhotoMetadataDb();
  const photoImageDb = new FakePhotoImageDb();
  let testUtils = new AdminPhotoControllerTestUtils(
    photoMetadataDb,
    photoImageDb,
  );
  let adminPhotoController: AdminPhotoController;
  let useCases: IUseCases;

  let app: Express;
  let req: TestAgent;
  let assertionsCounter: IAssertionsCounter;

  const _id = "1684a61d-de2f-43c0-a83b-6f8981a31e0c";
  const photo = dumbPhotoGenerator.generatePhoto({ _id });

  beforeEach(() => {
    testUtils.internalSetup();
    adminPhotoController = testUtils.getAdminPhotoController();
    useCases = testUtils.getUseCases();

    app = testUtils.getApp();
    req = request(app);
    assertionsCounter = new AssertionsCounter();
  });

  describe("addPhotoHandler", () => {
    const entryPoint = entryPoints.get(EntryPointId.AddPhoto);
    const path = entryPoint.getRelativePath();
    beforeEach(() => {
      app.post(path, adminPhotoController.addPhotoHandler);
    });

    it("should call the add-photo use case with the appropriate arguments and respond with status 200", async () => {
      const executeSpy = jest.spyOn(useCases.addPhoto, "execute");

      const payload = testUtils.getPayloadFromPhoto(photo);
      const response = await req.post(path).send(payload);

      sharedTestUtils.expectFunctionToBeCalledWith(
        assertionsCounter,
        executeSpy,
        photo,
      );
      expect(response.statusCode).toBe(200);
      assertionsCounter.increase();
      assertionsCounter.checkAssertions();
    });
  });

  describe("replacePhotoHandler", () => {
    const entryPoint = entryPoints.get(EntryPointId.ReplacePhoto);
    const path = entryPoint.getFullPathRaw();
    beforeEach(() => {
      app.put(path, adminPhotoController.replacePhotoHandler);
    });

    it("should call the replace-photo use case with the appropriate arguments and respond with status 200", async () => {
      const initPhoto = dumbPhotoGenerator.generatePhoto({ _id: photo._id });
      await testUtils.insertPhotoInDbs(initPhoto);
      const executeSpy = jest.spyOn(useCases.replacePhoto, "execute");

      const payload = testUtils.getPayloadFromPhoto(photo);
      const url = entryPoint.getFullPathWithParams({ id: initPhoto._id });
      const response = await req.put(url).send(payload);

      sharedTestUtils.expectFunctionToBeCalledWith(
        assertionsCounter,
        executeSpy,
        photo,
      );
      expect(response.statusCode).toBe(200);
      assertionsCounter.increase();
      assertionsCounter.checkAssertions();
    });
  });

  describe("deletePhotoHandler", () => {
    const entryPoint = entryPoints.get(EntryPointId.DeletePhoto);
    const path = entryPoint.getFullPathRaw();
    const url = entryPoint.getFullPathWithParams({ id: photo._id });
    beforeEach(() => {
      app.delete(path, adminPhotoController.deletePhotoHandler);
    });

    it("should call the delete-photo use case with the appropriate arguments and respond with status 200", async () => {
      const executeSpy = jest.spyOn(useCases.deletePhoto, "execute");

      const response = await req.delete(url);

      sharedTestUtils.expectFunctionToBeCalledWith(
        assertionsCounter,
        executeSpy,
        _id,
      );
      expect(response.statusCode).toBe(200);
      assertionsCounter.increase();
      assertionsCounter.checkAssertions();
    });
  });
});
