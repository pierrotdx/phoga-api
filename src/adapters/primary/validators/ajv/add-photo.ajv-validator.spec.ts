import bodyParser from "body-parser";
import express, {
  type Express,
  NextFunction,
  Request,
  Response,
} from "express";
import { clone, omit } from "ramda";
import request from "supertest";

import { IPhoto } from "@business-logic";
import { AddPhotoSchema } from "@http-server";
import { dumbPhotoGenerator } from "@utils";

import { getPayloadFromPhoto } from "../../express";
import { AddPhotoAjvValidator } from "./add-photo.ajv-validator";

describe("AddPhotoAjvValidator", () => {
  const photo = dumbPhotoGenerator.generate();
  const payload = getPayloadFromPhoto(photo);

  let addPhotoAjvValidator: AddPhotoAjvValidator;
  let dumbApp: Express;
  const spy = jest.fn((photo: IPhoto) => {});

  beforeEach(() => {
    dumbApp = express();
    dumbApp.use(bodyParser.json());
    addPhotoAjvValidator = new AddPhotoAjvValidator();
    dumbApp.post("/", getRequestHandler(addPhotoAjvValidator, spy));
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
        await expectErrorResponse(dumbApp, payloadWithoutId);
      },
    );

    it("should throw if the required date format is not respected", async () => {
      const payloadWithIncorrectDateFormat = clone(payload);
      payloadWithIncorrectDateFormat.date = new Date().toUTCString();
      await expectErrorResponse(dumbApp, payloadWithIncorrectDateFormat);
    });
  });
});

const getRequestHandler =
  (validator: AddPhotoAjvValidator, spy: jest.Func) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const photo = validator.validateAndParse(AddPhotoSchema, req.body);
      spy(photo);
      res.json(photo);
      next();
    } catch (err) {
      res.status(400).send(err);
      next(err);
    }
  };

const expectErrorResponse = async (app: Express, payload: string | object) => {
  const response = await request(app).post("/").send(payload);
  expect(response.statusCode).toBe(400);
  expect.assertions(1);
};
