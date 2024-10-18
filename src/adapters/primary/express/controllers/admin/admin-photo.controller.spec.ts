import { Express } from "express";
import request from "supertest";
import TestAgent from "supertest/lib/agent";

import {
  AddPhotoFakeValidator,
  AdminPhotoController,
  DeletePhotoFakeValidator,
  FakePhotoImageDb,
  FakePhotoMetadataDb,
  GetPhotoFakeValidator,
  ReplacePhotoFakeValidator,
  SearchPhotoFakeValidator,
} from "@adapters";
import {
  AddPhoto,
  DeletePhoto,
  GetPhoto,
  IPhotoImageDb,
  IPhotoMetadataDb,
  IUseCases,
  Photo,
  ReplacePhoto,
  SearchPhoto,
} from "@business-logic";
import {
  EntryPointId,
  IValidators,
  entryPoints,
  imageBufferEncoding,
} from "@http-server";
import { dumbPhotoGenerator } from "@utils";

import {
  getDumbApp,
  getPayloadFromPhoto,
  getUrlWithReplacedId,
} from "../../services/test-utils.service";

describe("adminPhotoController", () => {
  let adminPhotoController: AdminPhotoController;

  let imageDb: IPhotoImageDb;
  let metadataDb: IPhotoMetadataDb;

  let useCases: IUseCases;
  let validators: IValidators;

  let dumbApp: Express;
  let req: TestAgent;

  const _id = "1684a61d-de2f-43c0-a83b-6f8981a31e0c";
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

    adminPhotoController = new AdminPhotoController(useCases, validators);
    dumbApp = getDumbApp();
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

      const payload = getPayloadFromPhoto(photo);
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
      const initPhoto = dumbPhotoGenerator.generate({ _id });
      await imageDb.insert(initPhoto);
      const executeSpy = jest.spyOn(useCases.replacePhoto, "execute");

      const payload = getPayloadFromPhoto(photo);
      const response = await req.put(path).send(payload);

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenLastCalledWith(photo);
      expect(response.statusCode).toBe(200);
      expect.assertions(3);
    });
  });

  describe("deletePhotoHandler", () => {
    const entryPoint = entryPoints.get(EntryPointId.DeletePhoto);
    const path = entryPoint.getFullPath();
    const url = getUrlWithReplacedId(photo._id, EntryPointId.DeletePhoto);
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
