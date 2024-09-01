import dotenv from "dotenv";

import {
  AddPhotoAjvValidator,
  DeletePhotoAjvValidator,
  ExpressHttpServer,
  GetPhotoAjvValidator,
  MongoBase,
  PhotoImageDbGcs,
  PhotoMetadataDbMongo,
  getTestStorage,
} from "@adapters";
import {
  AddPhoto,
  DeletePhoto,
  GetPhoto,
  IPhotoImageDb,
  IPhotoMetadataDb,
  ReplacePhoto,
} from "@business-logic";

dotenv.config();

const mongoBase = new MongoBase(process.env.MONGO_URL, process.env.MONGO_DB);
let metadataDb: IPhotoMetadataDb;
mongoBase.open().then(() => {
  metadataDb = new PhotoMetadataDbMongo(mongoBase);
});

let imageDb: IPhotoImageDb;
getTestStorage().then((storage) => {
  imageDb = new PhotoImageDbGcs(storage);
});

const useCases = {
  getPhoto: new GetPhoto(metadataDb, imageDb),
  addPhoto: new AddPhoto(metadataDb, imageDb),
  replacePhoto: new ReplacePhoto(metadataDb, imageDb),
  deletePhoto: new DeletePhoto(metadataDb, imageDb),
};

const validators = {
  getPhoto: new GetPhotoAjvValidator(),
  addPhoto: new AddPhotoAjvValidator(),
  replacePhoto: new AddPhotoAjvValidator(),
  deletePhoto: new DeletePhotoAjvValidator(),
};

const expressHttpServer = new ExpressHttpServer(useCases, validators);
expressHttpServer.listen();
