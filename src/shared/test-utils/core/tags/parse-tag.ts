import { ITag } from "#tag-context";

export const parseTagDates = (tag: ITag) => {
  if (tag.manifest?.creation) {
    tag.manifest.creation = new Date(tag.manifest.creation);
  }
  if (tag.manifest?.lastUpdate) {
    tag.manifest.lastUpdate = new Date(tag.manifest.lastUpdate);
  }
};
