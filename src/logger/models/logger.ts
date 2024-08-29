type logFn = (message: string, meta?: object) => void;

export interface Logger {
  info: logFn;
  warn: logFn;
  error: logFn;
}
