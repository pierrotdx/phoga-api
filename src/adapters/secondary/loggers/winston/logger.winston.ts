import winston, {
  Logform,
  type Logger as WLogger,
  format,
  transport,
} from "winston";
import "winston-daily-rotate-file";

import { Logger } from "@logger";

export class LoggerWinston implements Logger {
  private winstonLogger: WLogger;

  private localTransport: transport;
  private consoleTransport: transport;

  constructor() {
    this.initLogger();
  }

  private initLogger() {
    this.setTransports();
    this.winstonLogger = winston.createLogger({
      transports: [this.localTransport, this.consoleTransport],
    });
  }

  private setTransports() {
    this.localTransport = this.getLocalTransport();
    this.consoleTransport = this.getConsoleTransport();
  }

  private getLocalTransport() {
    const localTransport = new winston.transports.DailyRotateFile({
      filename: "phoga-api-%DATE%.log",
      dirname: "logs",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
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

  error(err: unknown): void {
    if (err instanceof Error) {
      this.winstonLogger.error(err.name, err);
    } else {
      this.winstonLogger.error(err);
    }
  }
}
