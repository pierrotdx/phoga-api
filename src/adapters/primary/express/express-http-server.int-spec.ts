import { type Express } from "express";
import request from "supertest";
import {
  AddPhoto,
  DeletePhoto,
  GetPhoto,
  IPhotoImageDb,
  IPhotoMetadataDb,
  IUseCases,
  ReplacePhoto,
} from "@business-logic";
import {
  AddPhotoAjvValidator,
  DeletePhotoAjvValidator,
  GetPhotoAjvValidator,
  FakePhotoImageDb,
  FakePhotoMetadataDb,
  ExpressHttpServer,
} from "../..";
import { IValidators } from "@http-server";
import {
  addPhotoEntryPoint,
  deletePhotoEntryPoint,
  getImageEntryPoint,
  getMetadataEntryPoint,
  getPayloadFromPhoto,
  getUrlWithReplacedId,
  photoInDbFromStart,
  photoToAdd,
  photoToDelete,
  replacePhotoEntryPoint,
  replacingPhoto,
} from "./express-app.int-spec.utils";

describe("express app (image db: fake, metadata db: fake, validators: ajv) ", () => {
  let expressHttpServer: ExpressHttpServer;
  let app: Express;
  let metadataDb: IPhotoMetadataDb;
  let imageDb: IPhotoImageDb;
  let useCases: IUseCases;
  let validators: IValidators;

  beforeAll(async () => {
    metadataDb = new FakePhotoMetadataDb();
    imageDb = new FakePhotoImageDb();

    useCases = {
      getPhoto: new GetPhoto(metadataDb, imageDb),
      addPhoto: new AddPhoto(metadataDb, imageDb),
      replacePhoto: new ReplacePhoto(metadataDb, imageDb),
      deletePhoto: new DeletePhoto(metadataDb, imageDb),
    };

    validators = {
      getPhoto: new GetPhotoAjvValidator(),
      addPhoto: new AddPhotoAjvValidator(),
      replacePhoto: new AddPhotoAjvValidator(),
      deletePhoto: new DeletePhotoAjvValidator(),
    };

    expressHttpServer = new ExpressHttpServer(useCases, validators);
    expressHttpServer.listen();
    app = expressHttpServer.app;

    await useCases.addPhoto.execute(photoInDbFromStart);
  });

  afterAll(() => {
    expressHttpServer.close();
  });

  describe(`POST ${addPhotoEntryPoint}`, () => {
    it("should add the photo image and metadata to their respective DBs", async () => {
      const imageFromDbBefore = await imageDb.getById(photoToAdd._id);
      const metadataFromDbBefore = await metadataDb.getById(photoToAdd._id);

      const payload = getPayloadFromPhoto(photoToAdd);
      await request(app).post(addPhotoEntryPoint).send(payload);

      const imageFromDbAfter = await imageDb.getById(photoToAdd._id);
      expect(imageFromDbBefore).toBeUndefined();
      expect(imageFromDbAfter).toEqual(photoToAdd.imageBuffer);

      const metadataFromDbAfter = await metadataDb.getById(photoToAdd._id);
      expect(metadataFromDbBefore).toBeUndefined();
      expect(metadataFromDbAfter).toEqual(photoToAdd.metadata);

      expect.assertions(4);
    });
  });

  describe(`GET ${getMetadataEntryPoint}`, () => {
    it("should return the metadata of the photo with matching id", async () => {
      const url = getUrlWithReplacedId(
        photoInDbFromStart._id,
        getMetadataEntryPoint,
      );
      await request(app).get(url);
      const metadataFromDb = await metadataDb.getById(photoInDbFromStart._id);
      expect(metadataFromDb).toEqual(photoInDbFromStart.metadata);
      expect.assertions(1);
    });
  });

  describe(`GET ${getImageEntryPoint}`, () => {
    it("should return the image buffer of the photo with matching id", async () => {
      const url = getUrlWithReplacedId(
        photoInDbFromStart._id,
        getImageEntryPoint,
      );
      await request(app).get(url);
      const imageFromDb = await imageDb.getById(photoInDbFromStart._id);
      expect(imageFromDb).toEqual(photoInDbFromStart.imageBuffer);
      expect.assertions(1);
    });
  });

  describe(`PUT ${replacePhotoEntryPoint}`, () => {
    it("should replace the photo with the one in the request", async () => {
      const imageFromDbBefore = await imageDb.getById(photoInDbFromStart._id);
      const metadataFromDbBefore = await metadataDb.getById(
        photoInDbFromStart._id,
      );

      const payload = getPayloadFromPhoto(replacingPhoto);
      await request(app).put(replacePhotoEntryPoint).send(payload);

      expect(photoInDbFromStart._id).toBe(replacingPhoto._id);

      const imageFromDbAfter = await imageDb.getById(photoInDbFromStart._id);
      expect(imageFromDbAfter).not.toEqual(imageFromDbBefore);
      expect(imageFromDbAfter).toEqual(replacingPhoto.imageBuffer);

      const metadataFromDbAfter = await metadataDb.getById(
        photoInDbFromStart._id,
      );
      expect(metadataFromDbAfter).not.toEqual(metadataFromDbBefore);
      expect(metadataFromDbAfter).toEqual(replacingPhoto.metadata);

      expect.assertions(5);
    });
  });

  describe(`DELETE ${deletePhotoEntryPoint}`, () => {
    it("should delete the image and metadata from their respective DBs of the targeted photo", async () => {
      await useCases.addPhoto.execute(photoToDelete);
      const imageFromDbBefore = await imageDb.getById(photoToDelete._id);
      const metadataFromDbBefore = await metadataDb.getById(photoToDelete._id);

      const url = getUrlWithReplacedId(
        photoToDelete._id,
        deletePhotoEntryPoint,
      );
      await request(app).delete(url);

      expect(imageFromDbBefore).toBeDefined();
      const imageFromDbAfter = await imageDb.getById(photoToDelete._id);
      expect(imageFromDbAfter).toBeUndefined();

      expect(metadataFromDbBefore).toBeDefined();
      const metadataFromDbAfter = await metadataDb.getById(photoToDelete._id);
      expect(metadataFromDbAfter).toBeUndefined();

      expect.assertions(4);
    });
  });
});
