import bodyParser from "body-parser";
import express, {
  NextFunction,
  Request,
  Response,
  type Express,
} from "express";
import { clone, omit } from "ramda";
import request from "supertest";

import { AddPhotoAjvValidator } from "./add-photo.ajv-validator";
import { IPhoto, Photo } from "../../../../business-logic";
import { AddPhotoSchema, imageBufferEncoding } from "../../../../http-server";

describe("AddPhotoAjvValidator", () => {
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

const photo = new Photo("19e99c37-13d3-4d20-8da4-ce6c57c98b75", {
  imageBuffer: Buffer.from(
    "dumb test buffer eoijrngoqzeng",
    imageBufferEncoding,
  ),
  metadata: {
    date: new Date(),
    description: "dumb description aokznfjgfnh",
    location: "dumb test location erzuyerjgun",
    titles: [
      "dumb title 1 zeifunzerf",
      "dumb title 2 ergherigouner",
      "dumb title 3 perg,erogne",
    ],
  },
});

const payload = {
  _id: photo._id,
  imageBuffer: photo.imageBuffer!.toString(imageBufferEncoding),
  date: photo.metadata!.date!.toISOString(),
  description: photo.metadata!.description,
  location: photo.metadata!.location,
  titles: photo.metadata!.titles,
};

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
