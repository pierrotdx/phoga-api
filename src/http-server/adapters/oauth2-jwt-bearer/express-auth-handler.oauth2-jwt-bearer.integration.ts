import express, { type Express } from "express";
import request from "supertest";

import { Scope } from "../../core";
import { FakeTokenProvider } from "../token-provider";
import { ExpressAuthHandler } from "./express-auth-handler.oauth2-jwt-bearer";
import {
  audience,
  dumbReqHandler,
  issuerHost,
  issuerPort,
  restrictedRoute,
} from "./test-utils.service";

describe("ExpressAuthHandler", () => {
  const tokenProvider = new FakeTokenProvider(issuerHost, issuerPort);
  let authHandler: ExpressAuthHandler;
  let dumbApp: Express;

  beforeAll(async () => {
    await tokenProvider.start({ aud: audience });
  });

  beforeEach(() => {
    authHandler = new ExpressAuthHandler(tokenProvider.issuerBaseURL, audience);
    dumbApp = express();
    dumbApp.use(authHandler.requiresAuth);
  });

  afterAll(async () => {
    await tokenProvider.close();
  });

  describe("requiresAuth", () => {
    beforeEach(() => {
      dumbApp.get(restrictedRoute, dumbReqHandler);
    });

    it("should deny access to the requested route if no token is provided and respond with status code 401", async () => {
      const response = await request(dumbApp).get(restrictedRoute);
      expect(response.statusCode).toBe(401);
    });

    it("should allow access to the requested route if a valid token is provided and respond with status code 200", async () => {
      const token = await tokenProvider.getToken();
      const response = await request(dumbApp)
        .get(restrictedRoute)
        .auth(token, { type: "bearer" });
      expect(response.statusCode).toBe(200);
    });
  });

  describe("requiredScores", () => {
    const requiredScopes: Scope | Scope[] = [
      Scope.PhotosWrite,
      Scope.PhotosRead,
    ];

    beforeEach(async () => {
      const scopesHandler = authHandler.requiredScopes(requiredScopes);
      dumbApp.get(restrictedRoute, scopesHandler, dumbReqHandler);
    });

    it.each`
      case                         | value                                        | expectedStatus
      ${"does not have any of"}    | ${undefined}                                 | ${403}
      ${"does not contain all of"} | ${requiredScopes.slice(0, 1)}                | ${403}
      ${"does contain all of"}     | ${requiredScopes}                            | ${200}
      ${"does contain more than"}  | ${[...requiredScopes, Scope.RestrictedRead]} | ${200}
    `(
      "should respond with the status code $expectedStatus if the request $case the required scopes",
      async ({ value, expectedStatus }) => {
        const token = await tokenProvider.getToken({
          scope: value,
        });
        const response = await request(dumbApp)
          .get(restrictedRoute)
          .auth(token, { type: "bearer" });
        expect(response.statusCode).toBe(expectedStatus);
        expect.assertions(1);
      },
    );
  });
});
