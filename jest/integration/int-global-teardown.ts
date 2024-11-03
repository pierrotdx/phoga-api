import compose from "docker-compose";

import { DockerService } from "../../docker";
import { JestGlobalManager } from "../jest-global-manager";

class IntGlobalTeardown extends JestGlobalManager {
  constructor(configRelativePath: string) {
    super(configRelativePath);
  }

  actions = async (): Promise<void> => {
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

const configRelativePath = "/docker/tests";
const intGlobalTeardown = new IntGlobalTeardown(configRelativePath).execute;
export default intGlobalTeardown;
