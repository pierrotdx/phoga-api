import express, { type Express } from "express";
import request, { Response } from "supertest";
import { GetPhoto } from "../../../../../business-logic/use-cases/get-photo/get-photo";
import { PhotoController } from "./photo.controller";
import {
  AddPhotoFakeValidator,
  DeletePhotoFakeValidator,
  GetPhotoFakeValidator,
  ReplacePhotoFakeValidator,
} from "../../adapters/";
import {
  AddPhoto,
  DeletePhoto,
  GetPhotoField,
  IPhoto,
  IPhotoImageDb,
  IPhotoMetadataDb,
  Photo,
  ReplacePhoto,
} from "../../../../../business-logic";
import { FakePhotoImageDb, FakePhotoMetadataDb } from "../../../../secondary";
import { IPhotoControllerParams } from "../../models";
import { PhotoRouter } from "../routers";
import bodyParser from "body-parser";
import TestAgent from "supertest/lib/agent";
import { imageBufferEncoding } from "../../express-constants";

describe("photo controller", () => {
  let photoController: PhotoController;

  let imageDb: IPhotoImageDb;
  let metadataDb: IPhotoMetadataDb;

  let photoControllerParams: IPhotoControllerParams;

  let dumbApp: Express;
  let req: TestAgent;
  let res$: Promise<Response>;

  const id = "1684a61d-de2f-43c0-a83b-6f8981a31e0b";
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
    photoControllerParams = {
      getPhoto: {
        useCase: new GetPhoto(metadataDb, imageDb),
        validator: new GetPhotoFakeValidator(),
      },
      addPhoto: {
        useCase: new AddPhoto(metadataDb, imageDb),
        validator: new AddPhotoFakeValidator(),
      },
      replacePhoto: {
        useCase: new ReplacePhoto(imageDb, metadataDb),
        validator: new ReplacePhotoFakeValidator(),
      },
      deletePhoto: {
        useCase: new DeletePhoto(metadataDb, imageDb),
        validator: new DeletePhotoFakeValidator(),
      },
    };
    photoController = new PhotoController(photoControllerParams);
    dumbApp = getDumbApp(photoController);
    req = request(dumbApp);
  });

  describe("getPhotoMetadataHandler", () => {
    beforeEach(() => {
      res$ = req.get(`/${id}/metadata`);
    });

    it("should call the get-photo use case with the appropriate arguments", async () => {
      const useCase = photoControllerParams.getPhoto.useCase;
      const executeSpy = jest.spyOn(useCase, "execute");

      await res$;

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith(id, {
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
      const useCase = photoControllerParams.getPhoto.useCase;
      executeSpy = jest.spyOn(useCase, "execute");
      executeSpy.mockResolvedValueOnce(photo);

      res$ = req.get(`/${id}/image`);
    });

    it("should call the get-photo use case with the appropriate arguments", async () => {
      await res$;

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith(id, {
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

  describe("addPhotoHandler", () => {
    it("should call the add-photo use case with the appropriate arguments and respond with status 200", async () => {
      const useCase = photoControllerParams.addPhoto.useCase;
      const executeSpy = jest.spyOn(useCase, "execute");

      const payload = getReqPayloadFromPhoto(photo, imageBufferEncoding);
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
      const useCase = photoControllerParams.replacePhoto.useCase;
      const executeSpy = jest.spyOn(useCase, "execute");

      const payload = getReqPayloadFromPhoto(photo, imageBufferEncoding);
      const response = await req.put(`/`).send(payload);

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenLastCalledWith(photo);
      expect(response.statusCode).toBe(200);
      expect.assertions(3);
    });
  });

  describe("deletePhotoHandler", () => {
    it("should call the delete-photo use case with the appropriate arguments and respond with status 200", async () => {
      const useCase = photoControllerParams.deletePhoto.useCase;
      const executeSpy = jest.spyOn(useCase, "execute");

      const response = await req.delete(`/${photo._id}`);

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenLastCalledWith(id);
      expect(response.statusCode).toBe(200);
      expect.assertions(3);
    });
  });
});

function getDumbApp(photoController: PhotoController): Express {
  const app = express();
  app.use(bodyParser.json());
  const photoRouter = new PhotoRouter(photoController);
  app.use(photoRouter.router);
  return app;
}

function getReqPayloadFromPhoto(photo: IPhoto, encoding?: BufferEncoding) {
  return {
    _id: photo._id,
    imageBuffer: photo.imageBuffer!.toString(encoding),
    date: photo.metadata!.date!.toISOString(),
    description: photo.metadata!.description,
    location: photo.metadata!.location,
    titles: photo.metadata!.titles!.join(","),
  };
}
