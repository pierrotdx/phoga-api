import { readFile } from "fs/promises";

import { IPhoto, Photo } from "@business-logic";
import { Storage } from "@google-cloud/storage";

import { GcsBucket } from "../../gcs";

export async function deletePhotoImage(storage: Storage, id: IPhoto["_id"]) {
  const bucket = storage.bucket(GcsBucket.PhotoImages);
  const file = bucket.file(id);
  const exists = (await file.exists())[0];
  if (exists) {
    await file.delete();
  }
}

interface GeneratePhotoParams {
  id: IPhoto["_id"];
  imagePath: string;
}

export async function generatePhoto({
  id,
  imagePath,
}: GeneratePhotoParams): Promise<Photo> {
  const imageBuffer = await readFile(imagePath);
  const photo = new Photo(id, {
    imageBuffer: imageBuffer,
  });
  return photo;
}

export async function getPhotoImageBuffer(storage: Storage, id: IPhoto["_id"]) {
  const file = storage.bucket(GcsBucket.PhotoImages).file(id);
  const buffer = (await file.download())[0];
  return buffer;
}

export const photoParams: GeneratePhotoParams = {
  id: "8b41dfa0-1ea3-41ef-89e6-9f942e3e14d3",
  imagePath: "assets/test-img-1.jpg",
};
