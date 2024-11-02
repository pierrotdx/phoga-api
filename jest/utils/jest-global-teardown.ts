import compose from "docker-compose";

import { DockerService } from "../../docker";
import { JestGlobalManager } from "./jest-global-manager";

export class JestGlobalTeardown extends JestGlobalManager {
  constructor(configRelativePath: string) {
    super(configRelativePath);
  }

  execute = async (globalConfig, projectConfig) => {
    this.setConfigFullPathAndEnv(projectConfig.rootDir);
    await this.teardownContainer(DockerService.Gcs);
    await this.teardownContainer(DockerService.Mongo);
  };

  private teardownContainer = async (serviceName: DockerService) => {
    try {
      const result = await compose.down({
        cwd: this.configFullPath,
        commandOptions: [serviceName, ["--volumes"]],
      });
      console.info(result.err);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
}
