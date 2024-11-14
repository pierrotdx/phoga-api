import { ILogger } from "../../core";

export class LoggerConsole implements ILogger {
  info(message: string, meta?: object): void {
    console.info(message, meta);
  }
  warn(message: string, meta?: object): void {
    console.warn(message, meta);
  }
  error(err: unknown): void {
    console.error(err);
  }
}
