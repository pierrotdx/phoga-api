import compose from "docker-compose";

import { DockerService } from "../../docker";
import { JestGlobalManager } from "../jest-global-manager";

class IntGlobalSetup extends JestGlobalManager {
  constructor(configRelativePath: string) {
    super(configRelativePath);
  }

  actions = async (): Promise<void> => {
    await this.setupContainer(DockerService.Gcs);
    await this.setupContainer(DockerService.Mongo);
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
}

const configRelativePath = "/docker/tests";
const intGlobalSetup = new IntGlobalSetup(configRelativePath).execute;
export default intGlobalSetup;
