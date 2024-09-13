import express, { type Express } from "express";
import request from "supertest";

import { Permission } from "@http-server";

import { AuthExpressHandler } from "./auth-express-handler.oauth2-jwt-bearer";
import {
  OAuth2ServerMock,
  audience,
  dumbReqHandler,
  issuerHost,
  issuerPort,
  restrictedRoute,
} from "./test-utils.service";

describe("AuthExpressHandler", () => {
  const oauth2Server = new OAuth2ServerMock(issuerHost, issuerPort);
  let authProvider: AuthExpressHandler;
  let dumbApp: Express;

  beforeAll(async () => {
    await oauth2Server.start();
    oauth2Server.customizeEmittedTokens("all", { aud: audience });
  });

  beforeEach(() => {
    authProvider = new AuthExpressHandler(oauth2Server.issuerBaseURL, audience);
    dumbApp = express();
    dumbApp.use(authProvider.requiresAuth);
  });

  afterAll(async () => {
    await oauth2Server.stop();
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
      const token = await oauth2Server.fetchAccessToken();
      const response = await request(dumbApp)
        .get(restrictedRoute)
        .auth(token, { type: "bearer" });
      expect(response.statusCode).toBe(200);
    });
  });

  describe("hasPermissions", () => {
    const requiredPermissions: Permission | Permission[] = [
      Permission.PhotosWrite,
      Permission.PhotosRead,
    ];

    beforeEach(async () => {
      const permissionHandler =
        authProvider.hasPermissions(requiredPermissions);
      dumbApp.get(restrictedRoute, permissionHandler, dumbReqHandler);
    });

    it.each`
      case                         | value                                                  | expectedStatus
      ${"does not have any of"}    | ${undefined}                                           | ${403}
      ${"does not contain all of"} | ${requiredPermissions.slice(0, 1)}                     | ${403}
      ${"does contain all of"}     | ${requiredPermissions}                                 | ${200}
      ${"does contain more than"}  | ${[...requiredPermissions, Permission.RestrictedRead]} | ${200}
    `(
      "should respond with the status code `$expectedStatus` if the request $case the required permissions",
      async ({ value, expectedStatus }) => {
        if (value) {
          oauth2Server.customizeEmittedTokens("onlyNext", {
            scope: value,
          });
        }
        const token = await oauth2Server.fetchAccessToken();
        const response = await request(dumbApp)
          .get(restrictedRoute)
          .auth(token, { type: "bearer" });
        expect(response.statusCode).toBe(expectedStatus);
        expect.assertions(1);
      },
    );
  });
});
