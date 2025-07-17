import winston, {
  Logform,
  type Logger as WLogger,
  format,
  transport,
} from "winston";
import "winston-daily-rotate-file";

import { AbstractLogger, ILogEntry, LogFn } from "../../../core";

export class LoggerWinston extends AbstractLogger {
  private winstonLogger: WLogger;
  public transports: transport[];

  private localTransport: transport;
  private consoleTransport: transport;

  constructor(private readonly defaultSilent = false) {
    super();
    this.initLogger();
    if (this.defaultSilent) {
      this.mute();
    }
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
      silent: this.defaultSilent,
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
      silent: this.defaultSilent,
    });
    return consoleTransport;
  }

  private readonly transformInfoForConsole = ({
    level,
    message,
  }: Logform.TransformableInfo): string => {
    const timestamp = new Date().toISOString();
    return `${timestamp} ${level}: ${message}`;
  };

  mute(): void {
    this.winstonLogger.silent = true;
  }

  unmute(): void {
    this.winstonLogger.silent = false;
  }

  log: LogFn = (logEntry: ILogEntry): void => {
    if (logEntry.context) {
      this.winstonLogger.log(
        logEntry.level,
        logEntry.message,
        logEntry.context,
      );
    } else {
      this.winstonLogger.log(logEntry.level, logEntry.message);
    }
  };
}
