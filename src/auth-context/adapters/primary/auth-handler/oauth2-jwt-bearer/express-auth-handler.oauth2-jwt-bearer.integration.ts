import express, { type Express } from "express";
import request from "supertest";

import { Permission } from "@shared/models";

import { FakeTokenProvider } from "../../../secondary/token-provider";
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

  describe("requiredPermissions", () => {
    const requiredPermissions: Permission[] = [
      Permission.PhotosWrite,
      Permission.PhotosRead,
    ];

    beforeEach(async () => {
      const permissionsHandler =
        authHandler.requirePermissions(requiredPermissions);
      dumbApp.get(restrictedRoute, permissionsHandler, dumbReqHandler);
    });

    it.each`
      case                         | value                                                  | expectedStatus
      ${"does not have any of"}    | ${[undefined]}                                         | ${401}
      ${"does not contain all of"} | ${requiredPermissions.slice(0, 1)}                     | ${401}
      ${"does contain all of"}     | ${requiredPermissions}                                 | ${200}
      ${"does contain more than"}  | ${[...requiredPermissions, Permission.RestrictedRead]} | ${200}
    `(
      "should respond with the status code $expectedStatus if the request $case the required permissions",
      async ({ value, expectedStatus }) => {
        const token = await tokenProvider.getToken({
          permissions: value,
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
