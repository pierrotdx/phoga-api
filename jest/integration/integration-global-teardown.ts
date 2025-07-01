import { DockerService } from "../../docker";
import { JestGlobalManager } from "../jest-global-manager";
import { IConfigFolders } from "../models";

class IntGlobalTeardown extends JestGlobalManager {
  constructor(configFolders: IConfigFolders) {
    super(configFolders);
  }

  actions = async (): Promise<void> => {
    await this.teardownContainer(DockerService.Gcs);
    await this.teardownContainer(DockerService.Mongo);
  };
}

const configFolders: IConfigFolders = {
  env: "/docker/tests",
  dockerConfig: "/docker/tests",
};
const intGlobalTeardown = new IntGlobalTeardown(configFolders).execute;
export default intGlobalTeardown;
