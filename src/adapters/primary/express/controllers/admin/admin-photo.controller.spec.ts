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
} from "@business-logic";
import { IValidators, imageBufferEncoding } from "@http-server";

import { AdminPhotoRouter } from "../../routers/admin/admin-photo.router";
import {
  getDumbApp,
  getPayloadFromPhoto,
} from "../../services/test-utils.service";

describe("adminPhotoController", () => {
  let adminPhotoController: AdminPhotoController;

  let imageDb: IPhotoImageDb;
  let metadataDb: IPhotoMetadataDb;

  let useCases: IUseCases;
  let validators: IValidators;

  let dumbApp: Express;
  let req: TestAgent;

  const id = "1684a61d-de2f-43c0-a83b-6f8981a31e0c";
  const photo = new Photo(id, {
    imageBuffer: Buffer.from("dumb image buffer zeignzeirgn"),
    metadata: {
      date: new Date(),
      description: "dumb description zienvzeifn",
      location: "dumb location zrogneriugne",
      titles: ["dumb title 1 ziuefnzeriufn", "dumb title 2 i'urtht"],
    },
  });

  beforeEach(() => {
    imageDb = new FakePhotoImageDb();
    metadataDb = new FakePhotoMetadataDb();

    useCases = {
      getPhoto: new GetPhoto(metadataDb, imageDb),
      addPhoto: new AddPhoto(metadataDb, imageDb),
      replacePhoto: new ReplacePhoto(metadataDb, imageDb),
      deletePhoto: new DeletePhoto(metadataDb, imageDb),
    };

    validators = {
      getPhoto: new GetPhotoFakeValidator(),
      addPhoto: new AddPhotoFakeValidator(),
      replacePhoto: new ReplacePhotoFakeValidator(),
      deletePhoto: new DeletePhotoFakeValidator(),
    };

    adminPhotoController = new AdminPhotoController(useCases, validators);
    const router = new AdminPhotoRouter(adminPhotoController).getRouter();
    dumbApp = getDumbApp(router);
    req = request(dumbApp);
  });

  describe("addPhotoHandler", () => {
    it("should call the add-photo use case with the appropriate arguments and respond with status 200", async () => {
      const executeSpy = jest.spyOn(useCases.addPhoto, "execute");

      const payload = getPayloadFromPhoto(photo);
      const response = await req.post("/").send(payload);

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenLastCalledWith(photo);
      expect(response.statusCode).toBe(200);
      expect.assertions(3);
    });
  });

  describe("replacePhotoHandler", () => {
    it("should call the replace-photo use case with the appropriate arguments and respond with status 200", async () => {
      const initPhoto = new Photo(id, {
        imageBuffer: Buffer.from("init photo buffer", imageBufferEncoding),
      });
      await imageDb.insert(initPhoto);
      const executeSpy = jest.spyOn(useCases.replacePhoto, "execute");

      const payload = getPayloadFromPhoto(photo);
      const response = await req.put(`/`).send(payload);

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenLastCalledWith(photo);
      expect(response.statusCode).toBe(200);
      expect.assertions(3);
    });
  });

  describe("deletePhotoHandler", () => {
    it("should call the delete-photo use case with the appropriate arguments and respond with status 200", async () => {
      const executeSpy = jest.spyOn(useCases.deletePhoto, "execute");

      const response = await req.delete(`/${photo._id}`);

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenLastCalledWith(id);
      expect(response.statusCode).toBe(200);
      expect.assertions(3);
    });
  });
});
