import { IPhoto, IPhotoImageDb, IPhotoMetadataDb } from "@business-logic";

interface Dbs {
  metadataDb?: IPhotoMetadataDb;
  imageDb?: IPhotoImageDb;
}

export async function insertPhotosInDbs(photos: IPhoto[], dbs: Dbs) {
  await Promise.all(
    photos.map(async (photo) => {
      await insertPhotoInDbs(photo, dbs);
    }),
  );
}

async function insertPhotoInDbs(photo: IPhoto, dbs: Dbs) {
  if (dbs.metadataDb) {
    await dbs.metadataDb.insert(photo);
  }
  if (dbs.imageDb) {
    await dbs.imageDb.insert(photo);
  }
}

export async function deletePhotosInDbs(photoIds: IPhoto["_id"][], dbs: Dbs) {
  const deletePromises = photoIds.map(async (id) => {
    await deletePhotoInDbs(id, dbs);
  });
  await Promise.all(deletePromises);
}

export async function deletePhotoInDbs(photoId: IPhoto["_id"], dbs: Dbs) {
  if (dbs.metadataDb) {
    await dbs.metadataDb.delete(photoId);
  }
  if (dbs.imageDb) {
    await dbs.imageDb.delete(photoId);
  }
}
