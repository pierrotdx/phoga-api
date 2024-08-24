import path from "path";

import { IPhoto, Photo } from "@business-logic";
import { entryPoints, imageBufferEncoding } from "@http-server";

export const addPhotoEntryPoint = getUrl(
  entryPoints.baseUrl,
  entryPoints.photoBase,
  entryPoints.photo.add,
);

export const getMetadataEntryPoint = getUrl(
  entryPoints.baseUrl,
  entryPoints.photoBase,
  entryPoints.photo.getMetadata,
);

export const getImageEntryPoint = getUrl(
  entryPoints.baseUrl,
  entryPoints.photoBase,
  entryPoints.photo.getImage,
);

export const replacePhotoEntryPoint = getUrl(
  entryPoints.baseUrl,
  entryPoints.photoBase,
  entryPoints.photo.replace,
);

export const deletePhotoEntryPoint = getUrl(
  entryPoints.baseUrl,
  entryPoints.photoBase,
  entryPoints.photo.delete,
);

export function getUrl(...entryPoints: string[]): string {
  return path.join(...entryPoints).replace(/\\/g, "/");
}

export function getUrlWithReplacedId(id: string, ...entryPoints: string[]) {
  return getUrl(...entryPoints).replace(":id", id);
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

export function getPayloadFromPhoto(photo: IPhoto) {
  return {
    _id: photo._id,
    imageBuffer: photo.imageBuffer?.toString(imageBufferEncoding),
    location: photo.metadata?.location,
    description: photo.metadata?.description,
    titles: photo.metadata?.titles,
    date: photo.metadata?.date?.toISOString(),
  };
}
