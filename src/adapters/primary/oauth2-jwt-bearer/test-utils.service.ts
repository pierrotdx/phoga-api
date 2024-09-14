import { NextFunction, Request, Response } from "express";
import { OAuth2Server } from "oauth2-mock-server";
import { post } from "superagent";

import { Scope } from "@http-server";

export const issuerPort = 8080;
export const issuerHost = "localhost";
export const audience = "dumb-audience";
export const baseRoute = "/";
export const restrictedRoute = "/restricted";

type TokenCustomization = {
  scope?: Scope | Scope[];
  aud?: string;
};

export class OAuth2ServerMock {
  private readonly server: OAuth2Server;
  public readonly issuerBaseURL: string;
  private readonly tokenAlg = "RS256";

  constructor(
    private readonly issuerHost: string,
    private readonly issuerPort: number,
  ) {
    this.server = new OAuth2Server();
    this.issuerBaseURL = `http://${issuerHost}:${issuerPort.toString()}`;
  }

  async start(defaultTokenCustomization?: TokenCustomization) {
    await this.generateKey();
    if (defaultTokenCustomization) {
      this.customizeEmittedTokens("all", defaultTokenCustomization);
    }
    await this.server.start(this.issuerPort, this.issuerHost);
  }

  private async generateKey() {
    await this.server.issuer.keys.generate(this.tokenAlg);
  }

  async close() {
    await this.server.stop();
  }

  async fetchAccessToken(
    tokenCustomization?: TokenCustomization,
  ): Promise<string> {
    if (tokenCustomization) {
      this.customizeEmittedTokens("onlyNext", tokenCustomization);
    }
    const response = await post(`${this.issuerBaseURL}/token`).send({
      grant_type: "authorization_code",
    });
    return response.body.access_token;
  }

  customizeEmittedTokens(
    concernedEmissions: "onlyNext" | "all",
    customization: TokenCustomization,
  ) {
    if (concernedEmissions === "onlyNext") {
      this.server.service.once(
        "beforeTokenSigning",
        this.customizeToken(customization),
      );
    }
    if (concernedEmissions === "all") {
      this.server.service.on(
        "beforeTokenSigning",
        this.customizeToken(customization),
      );
    }
  }

  private customizeToken(customization: TokenCustomization) {
    return (token: any, req: unknown) => {
      const { aud, scope } = customization;
      if (aud) {
        token.payload.aud = aud;
      }
      if (scope) {
        token.payload.scope = Array.isArray(scope) ? scope.join(" ") : scope;
      }
    };
  }
}

export function dumbReqHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.status(200).json("dumb handler response");
}
