type logFn = (message: string, meta?: object) => void;

export interface ILogger {
  info: logFn;
  warn: logFn;
  error: (err: unknown) => void;
}
