import { IPhoto, Photo } from "@business-logic";

import { isPhoto } from "./is-photo";

describe("isPhoto", () => {
  const imageBuffer = Buffer.from("dumb buffer");
  const metadata: IPhoto["metadata"] = {
    date: new Date(),
    titles: ["title 1", "title 2"],
    description: "some dumb description",
    location: "dumb location",
  };
  let candidate: IPhoto;

  beforeEach(() => {
    candidate = new Photo("dumb id", { imageBuffer, metadata });
  });

  it("should return true if everything is ok", () => {
    expect(isPhoto(candidate)).toBe(true);
    expect.assertions(1);
  });

  it("should return true if there is no metadata", () => {
    delete candidate.metadata;
    expect(isPhoto(candidate)).toBe(true);
    expect.assertions(1);
  });

  it("should return false if candidate has no id", () => {
    delete candidate._id;
    expect(isPhoto(candidate)).toBe(false);
    expect.assertions(1);
  });

  it("should return false if candidate has no image buffer", () => {
    delete candidate.imageBuffer;
    expect(isPhoto(candidate)).toBe(false);
    expect.assertions(1);
  });

  it("should return false if candidate's image buffer is not an instance of buffer", () => {
    candidate.imageBuffer = "some string" as any;
    expect(isPhoto(candidate)).toBe(false);
    expect.assertions(1);
  });

  it("should return false if candidate's metadata.date is not an instance of date", () => {
    candidate.metadata = { date: 126 as any };
    expect(isPhoto(candidate)).toBe(false);
    expect.assertions(1);
  });

  it("should return false if candidate's metadata.location is not of type string", () => {
    candidate.metadata = { location: 156 as any };
    expect(isPhoto(candidate)).toBe(false);
    expect.assertions(1);
  });

  it("should return false if candidate's metadata.description is not of type string", () => {
    candidate.metadata = { description: 156 as any };
    expect(isPhoto(candidate)).toBe(false);
    expect.assertions(1);
  });

  it("should return false if candidate's metadata.titles is not an array", () => {
    candidate.metadata = { titles: 156 as any };
    expect(isPhoto(candidate)).toBe(false);
    expect.assertions(1);
  });

  it("should return false if candidate's metadata.titles is not an array of strings", () => {
    candidate.metadata = { titles: [156] as any };
    expect(isPhoto(candidate)).toBe(false);
    expect.assertions(1);
  });
});
