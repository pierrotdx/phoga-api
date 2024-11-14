import { AppHttpServerParams } from "./app-http-server-params";

export interface AppHttpServer {
  listen: (port: number) => void;
  close: () => void;
}
