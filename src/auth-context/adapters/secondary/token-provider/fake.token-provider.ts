import { Permission } from "#shared/models";
import { OAuth2Server } from "oauth2-mock-server";
import { isEmpty } from "ramda";
import { post } from "superagent";

import { ITokenProvider } from "../../../core";

type TokenCustomization = {
  permissions?: Permission | Permission[];
  aud?: string;
};

export class FakeTokenProvider implements ITokenProvider {
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

  async getToken(args?: {
    username?: string;
    password?: string;
    audience?: string;
    permissions?: Permission[];
  }): Promise<string> {
    const tokenCustomization: TokenCustomization = {
      permissions: args?.permissions,
      aud: args?.audience,
    };
    if (!isEmpty(tokenCustomization)) {
      this.customizeEmittedTokens("onlyNext", tokenCustomization);
    }
    const response = await post(`${this.issuerBaseURL}/token`).send({
      grant_type: "authorization_code",
    });
    return response.body.access_token;
  }

  private customizeEmittedTokens(
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
      const { aud, permissions } = customization;
      if (aud) {
        token.payload.aud = aud;
      }
      if (permissions) {
        token.payload.permissions = Array.isArray(permissions)
          ? permissions.join(" ")
          : permissions;
      }
    };
  }
}
