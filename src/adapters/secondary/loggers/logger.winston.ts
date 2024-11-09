import winston, {
  Logform,
  type Logger as WLogger,
  format,
  transport,
} from "winston";
import "winston-daily-rotate-file";

import { ILogger } from "@logger";

export class LoggerWinston implements ILogger {
  private winstonLogger: WLogger;

  public transports: transport[];

  private localTransport: transport;
  private consoleTransport: transport;

  constructor(private readonly silent = false) {
    this.initLogger();
  }

  private initLogger() {
    this.initTransports();
    this.winstonLogger = winston.createLogger({
      transports: [this.localTransport, this.consoleTransport],
    });
  }

  private initTransports() {
    this.localTransport = this.getLocalTransport();
    this.consoleTransport = this.getConsoleTransport();
    this.transports = [this.localTransport, this.consoleTransport];
  }

  private getLocalTransport() {
    const localTransport = new winston.transports.DailyRotateFile({
      filename: "phoga-api-%DATE%.log",
      dirname: "logs",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      silent: this.silent,
    });
    const localFormat = format.combine(format.timestamp(), format.json());
    localTransport.format = localFormat;
    localTransport.on("error", this.onLocalFileTransportError);
    return localTransport;
  }

  private readonly onLocalFileTransportError = (err: Error) => {
    console.error("localFileTransport error", err);
  };

  private getConsoleTransport() {
    const consoleTransport = new winston.transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(this.transformInfoForConsole),
      ),
      silent: this.silent,
    });
    return consoleTransport;
  }

  private transformInfoForConsole = ({
    level,
    message,
  }: Logform.TransformableInfo): string => {
    const timestamp = new Date().toISOString();
    return `${timestamp} ${level}: ${message}`;
  };

  info(message: string, meta?: object): void {
    this.winstonLogger.info(message, meta);
  }

  warn(message: string, meta?: object): void {
    this.winstonLogger.warn(message, meta);
  }

  error(err: Error | string): void {
    const error = new Error();
    error.stack = err instanceof Error ? err.stack : err;
    this.winstonLogger.error(error.stack);
  }
}
