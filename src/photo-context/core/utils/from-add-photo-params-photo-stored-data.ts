import { ITag, ITagDb } from "#tag-context";
import { IAddPhotoParams, IPhotoStoredData } from "photo-context/core/models";

export async function fromAddPhotoParamsToPhotoStoredData(
  addPhotoParams: IAddPhotoParams,
  tagDb: ITagDb,
): Promise<IPhotoStoredData> {
  const photoStoredData: IPhotoStoredData = {
    _id: addPhotoParams._id,
    metadata: addPhotoParams.metadata,
  };
  if (addPhotoParams.tagIds) {
    photoStoredData.tags = await getTags(tagDb, addPhotoParams.tagIds);
  }
  return photoStoredData;
}

async function getTags(tagDb: ITagDb, tagIds: ITag["_id"][]): Promise<ITag[]> {
  const tags$ = tagIds.map(async (id) => await tagDb.getById(id));
  const tags = await Promise.all(tags$);
  const hasInvalidTag = tags.some((t) => !t);
  if (hasInvalidTag) {
    throw new Error("failed retrieving tags");
  }
  return tags;
}
