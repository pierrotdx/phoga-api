import { FakePhotoImageDb, FakePhotoMetadataDb } from "@adapters";

import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { GetPhotoField, Photo } from "../../models";
import { AddPhoto } from "../add-photo/add-photo";
import { GetPhoto } from "./get-photo";

describe("get-photo use case", () => {
  const photo = new Photo("dumb id", {
    imageBuffer: Buffer.from("dumb buffer"),
    metadata: {
      titles: ["title 1", "title2"],
      date: new Date(),
      description: "dumb description",
      location: "Paris",
    },
  });

  let getPhoto: GetPhoto;
  let addPhoto: AddPhoto;
  let metadataDb: IPhotoMetadataDb;
  let imageDb: IPhotoImageDb;

  beforeEach(async () => {
    metadataDb = new FakePhotoMetadataDb();
    imageDb = new FakePhotoImageDb();
    getPhoto = new GetPhoto(metadataDb, imageDb);
    addPhoto = new AddPhoto(metadataDb, imageDb);

    await addPhoto.execute(photo);
  });

  it("should return the photo with matching id", async () => {
    const result = await getPhoto.execute(photo._id);
    expect(result).toBeDefined();
    expect(result._id).toBe(photo._id);
    expect(result).toEqual(photo);
    expect.assertions(3);
  });

  it.each`
    fieldName        | fieldValue
    ${"metadata"}    | ${GetPhotoField.Metadata}
    ${"imageBuffer"} | ${GetPhotoField.ImageBuffer}
  `(
    "should return the requested photo only with the `$fieldName` property when using the option `fields: [$fieldValue]`",
    async ({ fieldValue }) => {
      const result = await getPhoto.execute(photo._id, {
        fields: [fieldValue],
      });
      expect(result._id).toEqual(photo._id);
      if (fieldValue === GetPhotoField.Metadata) {
        expect(result.metadata).toEqual(photo.metadata);
        expect(result.imageBuffer).toBeUndefined();
      }
      if (fieldValue === GetPhotoField.ImageBuffer) {
        expect(result.imageBuffer).toEqual(photo.imageBuffer);
        expect(result.metadata).toBeUndefined();
      }
      expect.assertions(3);
    },
  );
});
