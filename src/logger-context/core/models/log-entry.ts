import { LogLabel } from "./log-label";
import { LogLevel } from "./log-level";

export interface ILogEntry {
  timestamp: Date;
  message: string;
  level: LogLevel;
  context?: unknown;
  labels?: LogLabel[];
}
