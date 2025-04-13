import {
  AssertionsCounter,
  IAssertionsCounter,
} from "#shared/assertions-counter";
import { IParser } from "#shared/models";
import bodyParser from "body-parser";
import express, { NextFunction, Request, Response } from "express";
import { Test, Response as TestResponse } from "supertest";

export abstract class ParserTestUtils<TParser extends IParser<unknown>> {
  protected abstract readonly testedParser: TParser;

  protected readonly app = express();
  protected abstract setupRouter(): void;
  protected abstract getRequest(payload: unknown): Test;

  protected parsedData: unknown;
  protected response: TestResponse;

  private readonly assertionsCounter: IAssertionsCounter =
    new AssertionsCounter();

  protected setupApp(): void {
    this.app.use(bodyParser.json());
    this.setupRouter();
  }

  protected requestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      this.parsedData = this.testedParser.parse(req);
      res.status(200).json();
      next();
    } catch (err) {
      console.error(err);
      next(err);
    }
  };

  async sendRequest(data: unknown): Promise<void> {
    this.response = await this.getRequest(data);
  }

  expectParsedDataToBe(expectedParsedData: unknown): void {
    expect(this.parsedData).toEqual(expectedParsedData);
    this.assertionsCounter.increase();
  }

  expectResponseStatusCode(expectedStatusCode: number): void {
    const statusCode = this.response.statusCode;
    expect(statusCode).toBe(expectedStatusCode);
    this.assertionsCounter.increase();
  }

  checkAssertions(): void {
    this.assertionsCounter.checkAssertions();
  }
}
