import { PhotoEntryPointId, PhotoEntryPoints } from "#photo-context";

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
