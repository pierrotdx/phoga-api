import bodyParser from "body-parser";
import express, { Express, NextFunction, Request, Response } from "express";
import { Test } from "supertest";

import { IValidator, TSchema } from "@http-server";

export class AjvTestUtils {
  public getDumbApp(): Express {
    const dumbApp = express();
    dumbApp.use(bodyParser.json());
    return dumbApp;
  }

  public getReqHandler<T>(
    schema: TSchema,
    validator: IValidator<T>,
    spy: jest.Func,
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = validator.validateAndParse(schema, {
          ...req.query,
          ...req.params,
          ...req.body,
        });
        spy(result);
        res.sendStatus(200);
      } catch (err) {
        console.error(err);
        res.status(400).send(err);
      }
    };
  }

  public async expectErrorResponse(req: Test, expectedStatusCode = 400) {
    const response = await req;
    expect(response.statusCode).toBe(expectedStatusCode);
    expect.assertions(1);
  }
}
