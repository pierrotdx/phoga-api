export interface IAppServer {
  listen: (port: number) => void;
  close: () => void;
}
