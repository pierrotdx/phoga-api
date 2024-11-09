import { LoggerWinston } from "@adapters";

import { AppLauncher } from "./app-launcher";

const logger = new LoggerWinston();
const app = new AppLauncher(logger);
app
  .start()
  .catch((err) => {
    logger.error(err);
  });
