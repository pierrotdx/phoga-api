export interface ITokenProvider {
  getToken(args: {
    username?: string;
    password?: string;
    audience?: string;
  }): Promise<string>;
}
