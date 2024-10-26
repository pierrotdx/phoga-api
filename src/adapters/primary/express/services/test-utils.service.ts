import bodyParser from "body-parser";
import express, { type Express } from "express";
import { Router } from "express";

import { IPhoto } from "@business-logic";
import { EntryPointId, entryPoints, imageBufferEncoding } from "@http-server";

export const addPhotoPath = entryPoints.getFullPathRaw(EntryPointId.AddPhoto);
export const getMetadataPath = entryPoints.getFullPathRaw(
  EntryPointId.GetPhotoMetadata,
);
export const getImagePath = entryPoints.getFullPathRaw(
  EntryPointId.GetPhotoImage,
);
export const replacePhotoPath = entryPoints.getFullPathRaw(
  EntryPointId.ReplacePhoto,
);
export const deletePhotoPath = entryPoints.getFullPathRaw(
  EntryPointId.DeletePhoto,
);
export const searchPhotoPath = entryPoints.getFullPathRaw(
  EntryPointId.SearchPhoto,
);

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

export function getDumbApp(router?: Router): Express {
  const app = express();
  app.use(bodyParser.json());
  if (router) {
    app.use(router);
  }
  return app;
}
