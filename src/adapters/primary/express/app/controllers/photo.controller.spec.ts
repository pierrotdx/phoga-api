import { Request, Response } from "express";
import { GetPhoto } from "../../../../../business-logic/use-cases/get-photo/get-photo";
import { PhotoController } from "./photo.controller";
import { AddPhotoFakeValidator, GetPhotoFakeValidator } from "../../adapters/";
import {
  AddPhoto,
  IPhotoImageDb,
  IPhotoMetadataDb,
  Photo,
} from "../../../../../business-logic";
import { FakePhotoImageDb, FakePhotoMetadataDb } from "../../../../secondary";
import { IAddPhotoValidator, IGetPhotoValidator } from "../../models";

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

  let dumbReq: Request;
  let dumbRes: Response;

  const id = "1684a61d-de2f-43c0-a83b-6f8981a31e0b";

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

    photoController = new PhotoController(getPhoto, addPhoto);

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

      const imageBuffer = Buffer.from("dumb image buffer zeignzeirgn");
      const date = new Date();
      const description = "dumb description zienvzeifn";
      const location = "dumb location zrogneriugne";
      const titles = ["dumb title 1 ziuefnzeriufn", "dumb title 2 i'urtht"];

      dumbReq.body = {
        _id: id,
        imageBuffer,
        date,
        description,
        location,
        titles,
      };

      await photoController.addPhotoHandler(dumbReq, dumbRes);

      const photo = new Photo(id, {
        imageBuffer,
        metadata: {
          date,
          description,
          location,
          titles,
        },
      });

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenLastCalledWith(photo);
      expect(dumbRes.sendStatus).toHaveBeenCalledWith(200);
      expect.assertions(3);
    });
  });
});
