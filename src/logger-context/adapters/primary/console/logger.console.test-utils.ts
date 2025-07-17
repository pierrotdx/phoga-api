import { LoggerConsole } from "./logger.console";

export class LoggerConsoleTestUtils {
  constructor(private readonly logger: LoggerConsole) {}

  isMuted = () => this.logger["silent"];
  simulateMutedState = (isMuted: boolean) => (this.logger["silent"] = isMuted);
}
