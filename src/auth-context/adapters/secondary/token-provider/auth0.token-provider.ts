import { AuthenticationClient } from "auth0";

import { ITokenProvider } from "../../../core";

export class Auth0TokenProvider implements ITokenProvider {
  private readonly auth0: AuthenticationClient;

  constructor(args: {
    domain: string;
    clientId: string;
    clientSecret: string;
  }) {
    this.auth0 = new AuthenticationClient(args);
  }

  async getToken(args: {
    username: string;
    password: string;
    audience: string;
  }): Promise<string> {
    const token = await this.auth0.oauth.passwordGrant(args);
    return token.data.access_token;
  }
}
