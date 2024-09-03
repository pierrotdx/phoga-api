import { Logger } from "@logger";

export class LoggerConsole implements Logger {
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
