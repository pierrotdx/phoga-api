import { type Express } from "express";
import request from "supertest";

import {
  MongoBase,
  PhotoImageDbGcs,
  PhotoMetadataDbMongo,
  getTestStorage,
} from "@adapters/databases";
import {
  AddPhotoAjvValidator,
  DeletePhotoAjvValidator,
  GetPhotoAjvValidator,
} from "@adapters/validators";
import {
  AddPhoto,
  DeletePhoto,
  GetPhoto,
  IPhotoImageDb,
  IPhotoMetadataDb,
  IUseCases,
  ReplacePhoto,
} from "@business-logic";
import { Storage } from "@google-cloud/storage";
import { IValidators } from "@http-server";

import { ExpressHttpServer } from "./express-http-server";
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
} from "./express-http.int-spec.utils";

describe("express app (image db: fake-gcs (docker), metadata db: mongo (docker), validators: ajv) ", () => {
  let expressHttpServer: ExpressHttpServer;
  let app: Express;
  let mongoBase: MongoBase;
  let metadataDb: IPhotoMetadataDb;
  let imageDb: IPhotoImageDb;
  let storage: Storage;
  let useCases: IUseCases;
  let validators: IValidators;

  beforeAll(async () => {
    mongoBase = new MongoBase(global.__MONGO_URL__, global.__MONGO_DB_NAME);
    await mongoBase.open();
    metadataDb = new PhotoMetadataDbMongo(mongoBase);

    storage = await getTestStorage();
    imageDb = new PhotoImageDbGcs(storage);

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

  afterAll(async () => {
    await mongoBase.close();
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
