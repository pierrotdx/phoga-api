import { type Express } from "express";
import request from "supertest";

import { IPhoto } from "@business-logic";
import { GetPhotoSchema } from "@http-server";

import { AjvTestUtils } from "./ajv.test-utils";
import { GetPhotoAjvValidator } from "./get-photo.ajv-validator";

describe("GetPhotoAjvValidator", () => {
  const ajvTestUtils = new AjvTestUtils();
  const id = "1789f4f5-1f00-4c1c-b871-c7ebe5a8f721";
  const spy = jest.fn((id: IPhoto["_id"]) => {});

  let getPhotoAjvValidator: GetPhotoAjvValidator;
  let dumbApp: Express;

  beforeEach(() => {
    dumbApp = ajvTestUtils.getDumbApp();
    getPhotoAjvValidator = new GetPhotoAjvValidator();
    const reqHandler = ajvTestUtils.getReqHandler(
      GetPhotoSchema,
      getPhotoAjvValidator,
      spy,
    );
    dumbApp.get("/:id", reqHandler);
  });

  describe("validateAndParse", () => {
    it("should extract the photo id from the request", async () => {
      await request(dumbApp).get(`/${id}`);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(id);
      expect.assertions(2);
    });

    it.each`
      case                                | value
      ${"undefined"}                      | ${undefined}
      ${"null"}                           | ${null}
      ${"a string not under uuid-format"} | ${"zigfneriguhrgieurh19516841651"}
    `("should throw if the photo id is `$case`", async ({ value }) => {
      const response = await request(dumbApp).get(`/${value}`);
      expect(response.statusCode).toBe(400);
      expect.assertions(1);
    });
  });
});
