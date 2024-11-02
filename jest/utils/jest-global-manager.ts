import dotenv from "dotenv";
import path from "path";

export class JestGlobalManager {
  protected configFullPath: string;
  protected env: any;

  constructor(private readonly configRelativePath: string) {}

  protected setConfigFullPathAndEnv(rootDir: string) {
    this.setConfigPath(rootDir);
    this.setEnv();
  }

  private setConfigPath(rootDir: string) {
    this.configFullPath = path.join(rootDir, this.configRelativePath);
  }

  private setEnv() {
    dotenv.config({ path: `${this.configFullPath}/.env` });
    this.env = process.env;
  }
}
