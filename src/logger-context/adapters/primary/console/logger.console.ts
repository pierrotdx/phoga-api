import { AbstractLogger, ILogEntry, LogFn, LogLevel } from "../../../core";

export class LoggerConsole extends AbstractLogger {
  private silent: boolean = false;

  mute(): void {
    this.silent = true;
  }

  unmute(): void {
    this.silent = false;
  }

  log: LogFn = (logEntry: ILogEntry): void => {
    if (this.silent) {
      return;
    }
    const messageToLog = this.getMessageToLog(logEntry);
    if (logEntry.level === LogLevel.Error) {
      console.error(messageToLog);
    } else if (logEntry.level === LogLevel.Warn) {
      console.warn(messageToLog);
    } else {
      console.info(messageToLog);
    }
  };

  private getMessageToLog(logEntry: ILogEntry): string {
    const context = logEntry.context
      ? JSON.stringify(logEntry.context)
      : undefined;
    return context ? `${logEntry.message} ${context}` : logEntry.message;
  }
}
