import { PhotoEntryPointId, PhotoEntryPoints } from "#photo-context";
import { TagEntryPointId, TagEntryPoints } from "#tag-context";

// Photo paths

export const photoEntryPoints = new PhotoEntryPoints();

export const addPhotoPath = photoEntryPoints.getFullPathRaw(
  PhotoEntryPointId.AddPhoto,
);

export const getMetadataPath = photoEntryPoints.getFullPathRaw(
  PhotoEntryPointId.GetPhotoMetadata,
);

export const getImagePath = photoEntryPoints.getFullPathRaw(
  PhotoEntryPointId.GetPhotoImage,
);

export const replacePhotoPath = photoEntryPoints.getFullPathRaw(
  PhotoEntryPointId.ReplacePhoto,
);

export const deletePhotoPath = photoEntryPoints.getFullPathRaw(
  PhotoEntryPointId.DeletePhoto,
);

export const searchPhotoPath = photoEntryPoints.getFullPathRaw(
  PhotoEntryPointId.SearchPhoto,
);

// Tag paths

export const tagEntryPoints = new TagEntryPoints();

export const addTagPath = tagEntryPoints.getFullPathRaw(TagEntryPointId.AddTag);

export const deleteTagPath = tagEntryPoints.getFullPathRaw(
  TagEntryPointId.DeleteTag,
);

export const replaceTagPath = tagEntryPoints.getFullPathRaw(
  TagEntryPointId.ReplaceTag,
);

export const getTagPath = tagEntryPoints.getFullPathRaw(TagEntryPointId.GetTag);

export const searchTagPath = tagEntryPoints.getFullPathRaw(
  TagEntryPointId.SearchTag,
);
