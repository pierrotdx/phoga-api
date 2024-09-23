import bodyParser from "body-parser";
import express, { type Express } from "express";
import { Router } from "express";

import { IPhoto } from "@business-logic";
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
