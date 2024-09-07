import bodyParser from "body-parser";
import express, { type Express } from "express";
import { Router } from "express";

import { IPhoto, Photo } from "@business-logic";
import { EntryPointId, entryPoints, imageBufferEncoding } from "@http-server";

export const addPhotoPath = entryPoints.getFullPath(EntryPointId.AddPhoto);
export const getMetadataPath = entryPoints.getFullPath(
  EntryPointId.GetPhotoMetadata,
);
export const getImagePath = entryPoints.getFullPath(EntryPointId.GetPhotoImage);
export const replacePhotoPath = entryPoints.getFullPath(
  EntryPointId.ReplacePhoto,
);
export const deletePhotoPath = entryPoints.getFullPath(
  EntryPointId.DeletePhoto,
);

export function getUrlWithReplacedId(id: string, entryPointId: EntryPointId) {
  return entryPoints.getFullPath(entryPointId).replace(":id", id);
}

export const photoInDbFromStart = new Photo(
  "7583bb57-ee95-4d4b-ada2-aac914aec427",
  {
    imageBuffer: Buffer.from(
      "dumb image buffer ezofj eriogjnerigjr zefnzef ",
      imageBufferEncoding,
    ),
    metadata: {
      location: "dumb location zoefnzeifnze rueygerugn",
      description: "dumb description oeirngeroingerijgn",
      titles: ["dumb titlte 1 po,goerng", "dumb title 2 eorignerkgnerigujne"],
      date: new Date(),
    },
  },
);

export const photoToAdd = new Photo("7583bb57-ee95-4d4b-ada2-aac914aec411", {
  imageBuffer: Buffer.from(
    "dumb image buffer ;nzoergnerj ",
    imageBufferEncoding,
  ),
  metadata: {
    location: "dumb location okrengoierng",
    description: "dumb description ejrngiuergn",
    titles: ["dumb titlte 1 erognerokgner"],
    date: new Date(),
  },
});

export const replacingPhoto = new Photo(photoInDbFromStart._id, {
  imageBuffer: Buffer.from(
    "dumb image buffer pk,reogknerogner",
    imageBufferEncoding,
  ),
  metadata: {
    location: "dumb location eorkgnertognortnzeofnzeigfnirgunreign",
    description: "dumb description 651fergkrng",
    titles: [
      "dumb titlte 1 651661",
      "dumb titlte 2 zgfezfzegfeznrgizefze",
      "title 3 zaeuyazduyefiueh",
    ],
    date: new Date(),
  },
});

export const photoToDelete = new Photo("7583bb57-ee95-4d4b-ada2-aac914aec725", {
  imageBuffer: Buffer.from(
    "dumb image buffer zijrgnfeirjgn",
    imageBufferEncoding,
  ),
  metadata: {
    location: "dumb location oejrgneijrtgn",
    description: "dumb description oekrtnitjegn",
    titles: [
      "dumb titlte 1 0341651",
      "dumb titlte 2 azef",
      "title 3 koerngitr",
    ],
    date: new Date(),
  },
});

export function getPayloadFromPhoto(
  photo: IPhoto,
  encoding = imageBufferEncoding,
) {
  return {
    _id: photo._id,
    imageBuffer: photo.imageBuffer?.toString(encoding),
    location: photo.metadata?.location,
    description: photo.metadata?.description,
    titles: photo.metadata?.titles,
    date: photo.metadata?.date?.toISOString(),
  };
}

export function getDumbApp(router: Router): Express {
  const app = express();
  app.use(bodyParser.json());
  app.use(router);
  return app;
}
