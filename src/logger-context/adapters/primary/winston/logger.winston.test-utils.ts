import { LoggerWinston } from "./logger.winston";

export class LoggerWinstonTestUtils {
  constructor(private readonly logger: LoggerWinston) {}

  isMuted = () => this.logger["winstonLogger"]["silent"];
  simulateMutedState = (isMuted: boolean) => {
    this.logger["winstonLogger"]["silent"] = isMuted;
  };
}
