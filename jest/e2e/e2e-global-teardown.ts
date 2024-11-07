import { DockerService } from "../../docker";
import { JestGlobalManager } from "../jest-global-manager";
import { IConfigFolders } from "../models";

class E2EtGlobalTeardown extends JestGlobalManager {
  constructor(configFolders: IConfigFolders) {
    super(configFolders);
  }

  actions = async (): Promise<void> => {
    await this.teardownContainer(DockerService.Gcs);
  };
}

const configFolders: IConfigFolders = {
  env: "./.env",
  dockerConfig: "/docker/tests",
};
const intGlobalTeardown = new E2EtGlobalTeardown(configFolders).execute;
export default intGlobalTeardown;
