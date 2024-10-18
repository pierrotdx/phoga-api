import { type Express } from "express";
import { clone, omit } from "ramda";
import request from "supertest";

import { IPhoto } from "@business-logic";
import { AddPhotoSchema } from "@http-server";
import { dumbPhotoGenerator } from "@utils";

import { getPayloadFromPhoto } from "../../express";
import { AddPhotoAjvValidator } from "./add-photo.ajv-validator";
import { AjvTestUtils } from "./ajv.test-utils";

describe("AddPhotoAjvValidator", () => {
  const ajvTestUtils = new AjvTestUtils();
  const photo = dumbPhotoGenerator.generate();
  const payload = getPayloadFromPhoto(photo);
  const spy = jest.fn((photo: IPhoto) => {});

  let addPhotoAjvValidator: AddPhotoAjvValidator;
  let dumbApp: Express;

  beforeEach(() => {
    dumbApp = ajvTestUtils.getDumbApp();
    addPhotoAjvValidator = new AddPhotoAjvValidator();
    dumbApp.post(
      "/",
      ajvTestUtils.getReqHandler(AddPhotoSchema, addPhotoAjvValidator, spy),
    );
  });

  describe("validateAndParse", () => {
    it("should parse the request data and return the expected photo", async () => {
      await request(dumbApp).post("/").send(payload);
      expect(spy).toHaveBeenCalledWith(photo);
      expect(spy).toHaveBeenLastCalledWith(photo);
      expect.assertions(2);
    });

    it.each`
      field
      ${"_id"}
      ${"imageBuffer"}
    `(
      "should throw if the required field `$field` is missing",
      async ({ field }) => {
        const payloadWithoutId = omit([field], payload);
        const req = request(dumbApp).post("/").send(payloadWithoutId);
        await ajvTestUtils.expectErrorResponse(req);
      },
    );

    it("should throw if the required date format is not respected", async () => {
      const payloadWithIncorrectDateFormat = clone(payload);
      payloadWithIncorrectDateFormat.date = new Date().toUTCString();

      const req = request(dumbApp)
        .post("/")
        .send(payloadWithIncorrectDateFormat);

      await ajvTestUtils.expectErrorResponse(req);
    });
  });
});
