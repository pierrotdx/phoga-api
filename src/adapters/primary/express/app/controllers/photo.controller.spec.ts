import { Request, Response } from "express";
import { GetPhoto } from "../../../../../business-logic/use-cases/get-photo/get-photo";
import { PhotoController } from "./photo.controller";
import {
  AddPhotoFakeValidator,
  GetPhotoFakeValidator,
  ReplacePhotoFakeValidator,
} from "../../adapters/";
import {
  AddPhoto,
  IPhotoImageDb,
  IPhotoMetadataDb,
  Photo,
  ReplacePhoto,
} from "../../../../../business-logic";
import { FakePhotoImageDb, FakePhotoMetadataDb } from "../../../../secondary";
import {
  IAddPhotoValidator,
  IGetPhotoValidator,
  IReplacePhotoValidator,
} from "../../models";

describe("photo controller", () => {
  let photoController: PhotoController;

  let imageDb: IPhotoImageDb;
  let metadataDb: IPhotoMetadataDb;

  let getPhoto: {
    useCase: GetPhoto;
    validator: IGetPhotoValidator;
  };

  let addPhoto: {
    useCase: AddPhoto;
    validator: IAddPhotoValidator;
  };

  let replacePhoto: {
    useCase: ReplacePhoto;
    validator: IReplacePhotoValidator;
  };

  let dumbReq: Request;
  let dumbRes: Response;

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

    getPhoto = {
      useCase: new GetPhoto(metadataDb, imageDb),
      validator: new GetPhotoFakeValidator(),
    };

    addPhoto = {
      useCase: new AddPhoto(metadataDb, imageDb),
      validator: new AddPhotoFakeValidator(),
    };

    replacePhoto = {
      useCase: new ReplacePhoto(imageDb, metadataDb),
      validator: new ReplacePhotoFakeValidator(),
    };

    photoController = new PhotoController(getPhoto, addPhoto, replacePhoto);

    dumbReq = {} as Request;
    dumbRes = jest.createMockFromModule<Response>("express");
    dumbRes.sendStatus = jest.fn();
  });

  describe("getPhotoHandler", () => {
    it("should extract the photo id from the request and call the get-photo use case", async () => {
      dumbReq["params"] = { id };
      const executeSpy = jest.spyOn(getPhoto.useCase, "execute");

      await photoController.getPhotoHandler(dumbReq, dumbRes);

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenLastCalledWith(id);
      expect.assertions(2);
    });
  });

  describe("addPhotoHandler", () => {
    it("should extract photo data from the request and call the add-photo use case ", async () => {
      const executeSpy = jest.spyOn(addPhoto.useCase, "execute");
      dumbReq.body = {
        _id: id,
        imageBuffer: photo.imageBuffer,
        date: photo.metadata!.date,
        description: photo.metadata!.description,
        location: photo.metadata!.location,
        titles: photo.metadata!.titles,
      };

      await photoController.addPhotoHandler(dumbReq, dumbRes);

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenLastCalledWith(photo);
      expect(dumbRes.sendStatus).toHaveBeenCalledWith(200);
      expect.assertions(3);
    });
  });

  describe("replacePhotoHandler", () => {
    it("should extract photo data from the request and call the replace-photo use case ", async () => {
      const executeSpy = jest.spyOn(replacePhoto.useCase, "execute");
      const initPhoto = new Photo(id, {
        imageBuffer: Buffer.from("init photo buffer"),
      });
      await imageDb.insert(initPhoto);
      dumbReq.body = {
        _id: id,
        imageBuffer: photo.imageBuffer,
        date: photo.metadata!.date,
        description: photo.metadata!.description,
        location: photo.metadata!.location,
        titles: photo.metadata!.titles,
      };

      await photoController.replacePhotoHandler(dumbReq, dumbRes);

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenLastCalledWith(photo);
      expect(dumbRes.sendStatus).toHaveBeenCalledWith(200);
      expect.assertions(3);
    });
  });
});
