import { Logger } from "@logger/models";

import { LoggerWinston } from "./adapters/secondary/loggers";

const logger: Logger = new LoggerWinston();

logger.info("Welcome to phoga api!");
const tmpError = new Error("testing error");
logger.error(tmpError.stack);
