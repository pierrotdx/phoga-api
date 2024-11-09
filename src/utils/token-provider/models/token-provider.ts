export interface ITokenProvider {
  getToken(args: {
    username?: string;
    password?: string;
    audience?: string;
    scope?: string;
  }): Promise<string>;
}
