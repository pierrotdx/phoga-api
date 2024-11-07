import compose from "docker-compose";
import dotenv from "dotenv";
import path from "path";

import { DockerService } from "../docker";
import { IConfigFolders } from "./models";

export abstract class JestGlobalManager {
  abstract actions?: () => Promise<void>;

  protected envPath: string;
  protected dockerConfigFolderPath: string;
  protected env: any;

  constructor(private readonly configFolders: IConfigFolders) {}

  execute = async (globalConfig, projectConfig) => {
    this.setEnvPath(projectConfig.rootDir);
    this.setDockerConfigPath(projectConfig.rootDir);
    this.setEnv();
    this.setGlobalVariables(projectConfig);
    if (this.actions) {
      await this.actions();
    }
  };

  private setEnvPath(rootDir: string) {
    if (this.configFolders.env) {
      this.envPath = path.join(rootDir, this.configFolders.env);
    }
  }

  private setDockerConfigPath(rootDir: string) {
    if (this.configFolders.dockerConfig) {
      this.dockerConfigFolderPath = path.join(
        rootDir,
        this.configFolders.dockerConfig,
      );
    }
  }

  private setEnv() {
    dotenv.config({ path: `${this.envPath}/.env` });
    this.env = process.env;
  }

  private setGlobalVariables = (projectConfig: any) => {
    if (!this.env) {
      return;
    }
    projectConfig.globals.__MONGO_URL__ = this.env.MONGO_URL;
    projectConfig.globals.__MONGO_DB_NAME__ = this.env.MONGO_DB;
    projectConfig.globals.__GCS_API_ENDPOINT__ = this.env.GCS_API_ENDPOINT;
    projectConfig.globals.__GCS_PROJECT_ID__ = this.env.GCS_PROJECT_ID;
  };

  setupContainer = async (serviceName: DockerService) => {
    try {
      const result = await compose.upOne(serviceName, {
        cwd: this.dockerConfigFolderPath,
      });
      console.info(result.err);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  teardownContainer = async (serviceName: DockerService) => {
    try {
      const result = await compose.down({
        cwd: this.dockerConfigFolderPath,
        commandOptions: [serviceName, ["--volumes"]],
      });
      console.info(result.err);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
}
