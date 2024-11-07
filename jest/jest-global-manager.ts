import dotenv from "dotenv";
import path from "path";

interface IJestGlobalManager {
  execute(globalConfig, projectConfig): Promise<void>;
  actions?: () => Promise<void>;
}

export class JestGlobalManager implements IJestGlobalManager {
  actions?: () => Promise<void>;

  protected configFullPath: string;
  protected env: any;

  constructor(private readonly configRelativePath: string) {}

  execute = async (globalConfig, projectConfig) => {
    this.setConfigFullPath(projectConfig.rootDir);
    this.setEnv();
    this.setGlobalVariables(projectConfig);
    if (this.actions) {
      await this.actions();
    }
  };

  private setConfigFullPath(rootDir: string) {
    this.configFullPath = path.join(rootDir, this.configRelativePath);
  }

  private setEnv() {
    dotenv.config({ path: `${this.configFullPath}/.env` });
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
}
