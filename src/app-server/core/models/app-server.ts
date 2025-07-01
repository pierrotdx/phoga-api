export interface IAppServer {
  listen: (port: number) => void;
  close: () => Promise<void>;
}
