import { Express } from "express";
import request from "supertest";
import TestAgent from "supertest/lib/agent";

import {
  AssertionsCounter,
  IAssertionsCounter,
} from "@shared/assertions-counter";
import { SharedTestUtils } from "@shared/shared-test-utils";

import {
  AdminPhotoController,
  IPhoto,
  IUseCases,
  PhotoEntryPointId,
  entryPoints,
} from "../../../";
import {
  FakePhotoImageDb,
  FakePhotoMetadataDb,
  dumbPhotoGenerator,
} from "../../../../adapters";
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
    const entryPoint = entryPoints.get(PhotoEntryPointId.AddPhoto);
    const path = entryPoint.getRelativePath();

    beforeEach(() => {
      spy = jest.spyOn(useCases.addPhoto, "execute");
      app.post(path, adminPhotoController.addPhotoHandler);
    });

    afterEach(() => {
      spy.mockReset();
    });

    it("should call the add-photo use case with the appropriate arguments and respond with status 200", async () => {
      const addReq = req.post(path);
      testUtils.addFormDataToReq(addReq, photo);
      const response = await addReq;
      expect(spy).toHaveBeenCalledTimes(1);
      expect(response.statusCode).toBe(200);
      expect.assertions(2);
    });
  });

  describe("replacePhotoHandler", () => {
    const entryPoint = entryPoints.get(PhotoEntryPointId.ReplacePhoto);
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
      const url = entryPoint.getFullPathWithParams({ id: photoToReplace._id });
      const replaceReq = req.put(url);
      testUtils.addFormDataToReq(replaceReq, replacingPhoto);
      const response = await replaceReq;
      expect(spy).toHaveBeenCalledTimes(1);
      expect(response.statusCode).toBe(200);
      expect.assertions(2);
    });
  });

  describe("deletePhotoHandler", () => {
    const entryPoint = entryPoints.get(PhotoEntryPointId.DeletePhoto);
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
