import { Express } from "express";
import request from "supertest";

import { ISearchPhotoOptions, SortDirection } from "@business-logic";
import { SearchPhotoSchema } from "@http-server";

import { AjvTestUtils } from "./ajv.test-utils";
import { SearchPhotoAjvValidator } from "./search-photo.ajv-validator";

describe("SearchPhotoAjvValidator", () => {
  const executeSearchPhotoMock = (options?: ISearchPhotoOptions) => {};

  const ajvTestUtils = new AjvTestUtils();
  let spy: jest.Func;

  let searchPhotoAjvValidator: SearchPhotoAjvValidator;
  let app: Express;

  beforeEach(() => {
    spy = jest.fn(executeSearchPhotoMock);
    app = ajvTestUtils.getDumbApp();
    setupApp({ ajvTestUtils, app, searchPhotoAjvValidator, spy });
  });

  describe("validateAndParse", () => {
    it.each`
      case                                  | options                                  | expectedStatus
      ${"rendering.from has invalid value"} | ${{ rendering: { from: "start" } }}      | ${400}
      ${"rendering.size has invalid value"} | ${{ rendering: { size: "small" } }}      | ${400}
      ${"rendering.date has invalid value"} | ${{ rendering: { date: "2024-10-10" } }} | ${400}
    `(
      "should respond with status $expectedStatus when $case",
      async ({
        options,
        expectedStatusCode,
      }: {
        options: ISearchPhotoOptions;
        expectedStatusCode: number;
      }) => {
        const queryParams = getQueryParams(options);
        const req = request(app).get("/").query(queryParams);
        await ajvTestUtils.expectErrorResponse(req, expectedStatusCode);
      },
    );

    it.each`
      case                                   | options
      ${"rendering.from"}                    | ${{ rendering: { from: 11 } }}
      ${"rendering.size"}                    | ${{ rendering: { size: 100 } }}
      ${"rendering.date"}                    | ${{ rendering: { date: SortDirection.Ascending } }}
      ${"rendering.date"}                    | ${{ rendering: { date: SortDirection.Descending } }}
      ${"excludeImages"}                     | ${{ excludeImages: true }}
      ${"excludeImages"}                     | ${{ excludeImages: false }}
      ${"rendering.date and rendering.size"} | ${{ rendering: { date: SortDirection.Descending, size: 99 } }}
    `(
      "should extract the $case query string parameter",
      async ({ options }: { options: ISearchPhotoOptions }) => {
        const queryParams = getQueryParams(options);
        const response = await request(app).get("/").query(queryParams);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenLastCalledWith(options);
        expect(response.statusCode).toBe(200);
        expect.assertions(3);
      },
    );
  });
});

function setupApp({
  ajvTestUtils,
  app,
  searchPhotoAjvValidator,
  spy,
}: {
  ajvTestUtils: AjvTestUtils;
  app: Express;
  searchPhotoAjvValidator: SearchPhotoAjvValidator;
  spy: jest.Func;
}) {
  searchPhotoAjvValidator = new SearchPhotoAjvValidator();
  const reqHandler = ajvTestUtils.getReqHandler(
    SearchPhotoSchema,
    searchPhotoAjvValidator,
    spy,
  );
  app.get("/", reqHandler);
}

function getQueryParams(options: ISearchPhotoOptions) {
  const { rendering, excludeImages } = options;
  let queryParams = {};
  if (rendering) {
    queryParams = { ...rendering };
  }
  if (typeof excludeImages === "boolean") {
    queryParams = { ...queryParams, excludeImages };
  }
  return queryParams;
}
