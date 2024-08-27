import compose from "docker-compose";
import path from "path";

import { DockerService } from "./constants.docker";

export const setupContainer = async (
  serviceName: DockerService,
  configRepo: string = path.join(__dirname),
) => {
  try {
    const result = await compose.upOne(serviceName, { cwd: configRepo });
    console.info(result.err);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const teardownContainer = async (
  serviceName: DockerService,
  configRepo: string = path.join(__dirname),
) => {
  try {
    const result = await compose.down({
      cwd: configRepo,
      commandOptions: [serviceName, ["--volumes"]],
    });
    console.info(result.err);
  } catch (err) {
    console.error(err);
    throw err;
  }
};
