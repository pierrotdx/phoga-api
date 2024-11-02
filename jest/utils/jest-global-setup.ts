import compose from "docker-compose";

import { DockerService } from "../../docker";
import { JestGlobalManager } from "./jest-global-manager";

export class JestGlobalSetup extends JestGlobalManager {
  constructor(configRelativePath: string) {
    super(configRelativePath);
  }

  execute = async (globalConfig, projectConfig) => {
    this.setConfigFullPathAndEnv(projectConfig.rootDir);
    await this.setupContainer(DockerService.Gcs);
    await this.setupContainer(DockerService.Mongo);
    this.setGlobalVariables(projectConfig);
  };

  private setupContainer = async (serviceName: DockerService) => {
    try {
      const result = await compose.upOne(serviceName, {
        cwd: this.configFullPath,
      });
      console.info(result.err);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  private setGlobalVariables = (projectConfig: any) => {
    projectConfig.globals.__MONGO_URL__ = this.env.MONGO_URL;
    projectConfig.globals.__MONGO_DB_NAME__ = this.env.MONGO_DB;
  };
}
