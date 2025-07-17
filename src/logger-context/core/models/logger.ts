import { ILogEntryOptions, LogEntry } from "../log-entry/log-entry";
import { LogFn } from "./log-fn";
import { LogLevel } from "./log-level";

export interface ILogger {
  log: LogFn;
  mute(): void;
  unmute(): void;
}

export abstract class AbstractLogger implements ILogger {
  abstract log: LogFn;
  abstract mute(): void;
  abstract unmute(): void;

  readonly info = (message: string, context?: unknown): void => {
    const logEntry = new LogEntry(LogLevel.Info, message, context);
    this.log(logEntry);
  };

  readonly warn = (message: string, options?: ILogEntryOptions): void => {
    const logEntry = new LogEntry(LogLevel.Warn, message, options);
    this.log(logEntry);
  };

  readonly error = (err: Error): void => {
    const logEntry = new LogEntry(LogLevel.Error, err.message, {
      context: err,
    });
    this.log(logEntry);
  };
}
