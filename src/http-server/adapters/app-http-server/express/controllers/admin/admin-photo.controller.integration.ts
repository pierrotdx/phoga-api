import { Express } from "express";
import request from "supertest";
import TestAgent from "supertest/lib/agent";

import { AssertionsCounter, IAssertionsCounter } from "@assertions-counter";
import {
  FakePhotoImageDb,
  FakePhotoMetadataDb,
  IPhoto,
  IUseCases,
} from "@domain";
import { dumbPhotoGenerator } from "@dumb-photo-generator";
import { AdminPhotoController, EntryPointId, entryPoints } from "@http-server";
import { SharedTestUtils } from "@shared";

import { AdminPhotoControllerTestUtils } from "./admin-photo.controller.test-utils";

describe("adminPhotoController", () => {
  const photoMetadataDb = new FakePhotoMetadataDb();
  const photoImageDb = new FakePhotoImageDb();
  const sharedTestUtils = new SharedTestUtils();
  let testUtils = new AdminPhotoControllerTestUtils(
    photoMetadataDb,
    photoImageDb,
  );
  let adminPhotoController: AdminPhotoController;
  let useCases: IUseCases;

  let app: Express;
  let req: TestAgent;
  let assertionsCounter: IAssertionsCounter;
  let spy: jest.SpyInstance;

  const _id = "1684a61d-de2f-43c0-a83b-6f8981a31e0c";
  let photo: IPhoto;

  beforeEach(async () => {
    photo = await dumbPhotoGenerator.generatePhoto({ _id });
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
      spy = jest.spyOn(useCases.addPhoto, "execute");
      app.post(path, adminPhotoController.addPhotoHandler);
    });

    afterEach(() => {
      spy.mockReset();
    });

    it("should call the add-photo use case with the appropriate arguments and respond with status 200", async () => {
      const payload = testUtils.getPayloadFromPhoto(photo);
      const response = await req.post(path).send(payload);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(response.statusCode).toBe(200);
      expect.assertions(2);
    });
  });

  describe("replacePhotoHandler", () => {
    const entryPoint = entryPoints.get(EntryPointId.ReplacePhoto);
    const path = entryPoint.getFullPathRaw();
    let photoToReplace: IPhoto;
    let replacingPhoto: IPhoto;

    beforeEach(async () => {
      photoToReplace = await dumbPhotoGenerator.generatePhoto({});
      await testUtils.insertPhotoInDbs(photoToReplace);
      replacingPhoto = await dumbPhotoGenerator.generatePhoto({
        _id: photoToReplace._id,
      });
      app.put(path, adminPhotoController.replacePhotoHandler);
      spy = jest.spyOn(useCases.replacePhoto, "execute");
    });

    afterEach(() => {
      spy.mockReset();
    });

    it("should call the replace-photo use case with the appropriate arguments and respond with status 200", async () => {
      const payload = testUtils.getPayloadFromPhoto(replacingPhoto);
      const url = entryPoint.getFullPathWithParams({ id: photoToReplace._id });
      const response = await req.put(url).send(payload);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(response.statusCode).toBe(200);
      expect.assertions(2);
    });
  });

  describe("deletePhotoHandler", () => {
    const entryPoint = entryPoints.get(EntryPointId.DeletePhoto);
    const path = entryPoint.getFullPathRaw();
    let url: string;

    beforeAll(() => {
      url = entryPoint.getFullPathWithParams({ id: photo._id });
    });

    beforeEach(() => {
      app.delete(path, adminPhotoController.deletePhotoHandler);
      spy = jest.spyOn(useCases.deletePhoto, "execute");
    });

    afterEach(() => {
      spy.mockReset();
    });

    it("should call the delete-photo use case with the appropriate arguments and respond with status 200", async () => {
      spy.mockReset();
      const response = await req.delete(url);

      sharedTestUtils.expectFunctionToBeCalledWith(assertionsCounter, spy, _id);
      expect(response.statusCode).toBe(200);
      assertionsCounter.increase();
      assertionsCounter.checkAssertions();
    });
  });
});
