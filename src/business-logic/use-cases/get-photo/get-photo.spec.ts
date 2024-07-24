import { get } from "http";
import { FakePhotoImageDb, FakePhotoMetadataDb } from "../../../adapters";
import { IPhotoImageDb, IPhotoMetadataDb } from "../../gateways";
import { IPhotoMetadata, Photo } from "../../models";
import { GetPhoto } from "./get-photo";
import exp from "constants";

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
  let metadataDb: IPhotoMetadataDb;
  let imageDb: IPhotoImageDb;

  beforeEach(() => {
    metadataDb = new FakePhotoMetadataDb();
    imageDb = new FakePhotoImageDb();
    getPhoto = new GetPhoto(metadataDb, imageDb);
  });

  it("should return the photo with matching id", async () => {
    await imageDb.save(photo);
    await metadataDb.save(photo);

    const result = await getPhoto.execute(photo._id);
    expect(result).toBeDefined();
    expect(result._id).toBe(photo._id);
    expect(result).toEqual(photo);
    expect.assertions(3);
  });
});
