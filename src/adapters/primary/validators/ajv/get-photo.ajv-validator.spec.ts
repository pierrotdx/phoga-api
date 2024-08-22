import express, {
  NextFunction,
  Request,
  Response,
  type Express,
} from "express";
import request from "supertest";
import { GetPhotoAjvValidator } from "./get-photo.ajv-validator";
import { IPhoto } from "../../../../business-logic";
import { GetPhotoSchema } from "../../../../http-server";

describe("GetPhotoAjvValidator", () => {
  let getPhotoAjvValidator: GetPhotoAjvValidator;
  let dumbApp: Express;
  const spy = jest.fn((id: IPhoto["_id"]) => {});

  beforeEach(() => {
    dumbApp = express();
    getPhotoAjvValidator = new GetPhotoAjvValidator();
    const reqHandler = getReqHandler(getPhotoAjvValidator, spy);
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

const id = "1789f4f5-1f00-4c1c-b871-c7ebe5a8f721";

const getReqHandler =
  (validator: GetPhotoAjvValidator, spy: jest.Func) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = validator.validateAndParse(GetPhotoSchema, req.params);
      spy(id);
      next();
    } catch (err) {
      res.status(400).send(err);
      next(err);
    }
  };
