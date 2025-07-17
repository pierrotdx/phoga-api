import { ILogEntry, LogLabel, LogLevel } from "../models";

export interface ILogEntryOptions {
  context?: unknown;
  labels?: LogLabel[];
}

export class LogEntry implements ILogEntry {
  timestamp: Date;
  context?: unknown;
  labels: LogLabel[] = [LogLabel.PhogaApi];

  constructor(
    public level: LogLevel,
    public message: string,
    options?: ILogEntryOptions,
  ) {
    this.timestamp = new Date();
    if (options?.context) {
      this.context = options.context;
    }
    if (options?.labels) {
      this.labels = [...this.labels, ...options.labels];
    }
  }
}
