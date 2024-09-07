import { Storage } from "@google-cloud/storage";

import { gcsTestApiEndpoint } from "./constants.gcs";
import { GcsBucket } from "./models";

export async function getTestStorage(): Promise<Storage> {
  const storage = new Storage({
    apiEndpoint: gcsTestApiEndpoint,
    projectId: "test",
  });
  await setupPhotoImageBucket(storage);
  return storage;
}

async function setupPhotoImageBucket(storage: Storage) {
  try {
    const bucket = storage.bucket(GcsBucket.PhotoImages);
    await bucket.deleteFiles();
  } catch (err) {
    await onSetupPhotoImageBucketError(err, storage);
  }
}

async function onSetupPhotoImageBucketError(err: any, storage: Storage) {
  if (err.message.includes("Not Found")) {
    await storage.createBucket(GcsBucket.PhotoImages);
  } else {
    throw err;
  }
}
