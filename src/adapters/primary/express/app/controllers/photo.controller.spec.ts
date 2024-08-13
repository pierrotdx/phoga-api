import { Request, Response } from "express";
import { GetPhoto } from "../../../../../business-logic/use-cases/get-photo/get-photo";
import { PhotoController } from "./photo.controller";
import { GetPhotoFakeValidator } from "../../adapters/";
import { IPhotoImageDb, IPhotoMetadataDb } from "../../../../../business-logic";
import { FakePhotoImageDb, FakePhotoMetadataDb } from "../../../../secondary";
import { IGetPhotoValidator } from "../../models";

describe("photo controller", () => {
  let photoController: PhotoController;
  const dumbReq = {} as Request;
  const dumbRes = jest.createMockFromModule<Response>("express");
  dumbRes.sendStatus = jest.fn();

  let imageDb: IPhotoImageDb;
  let metadataDb: IPhotoMetadataDb;
  let getPhoto: GetPhoto;

  let getPhotoValidator: IGetPhotoValidator;

  beforeEach(() => {
    imageDb = new FakePhotoImageDb();
    metadataDb = new FakePhotoMetadataDb();
    getPhotoValidator = new GetPhotoFakeValidator();
    getPhoto = new GetPhoto(metadataDb, imageDb);
    photoController = new PhotoController({
      useCase: getPhoto,
      validator: getPhotoValidator,
    });
  });

  describe("getPhotoHandler", () => {
    it("should extract the photo id from the request, call the get-photo use case, and respond with status 200", async () => {
      const id = "1684a61d-de2f-43c0-a83b-6f8981a31e0b";
      dumbReq["params"] = { id };
      const executeSpy = jest.spyOn(getPhoto, "execute");

      await photoController.getPhotoHandler(dumbReq, dumbRes);

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenNthCalledWith(1, id);
      expect(dumbRes.sendStatus).toHaveBeenCalledWith(200);
      expect.assertions(3);
    });
  });
});
