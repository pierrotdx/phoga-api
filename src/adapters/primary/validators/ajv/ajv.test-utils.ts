import bodyParser from "body-parser";
import express, { Express, NextFunction, Request, Response } from "express";
import request from "supertest";

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
          ...req.params,
          ...req.body,
        });
        spy(result);
        next();
      } catch (err) {
        res.status(400).send(err);
        next(err);
      }
    };
  }

  public async expectErrorResponse(app: Express, payload: string | object) {
    const response = await request(app).post("/").send(payload);
    expect(response.statusCode).toBe(400);
    expect.assertions(1);
  }
}
