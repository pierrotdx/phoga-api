import { DockerService } from "../../docker";
import { JestGlobalManager } from "../jest-global-manager";
import { IConfigFolders } from "../models";

class E2EGlobalSetup extends JestGlobalManager {
  constructor(configFolders: IConfigFolders) {
    super(configFolders);
  }

  actions = async (): Promise<void> => {
    await this.setupContainer(DockerService.Gcs);
  };
}

const configFolders: IConfigFolders = {
  env: "/jest/e2e",
  dockerConfig: "/docker/tests",
};
const e2eGlobalSetup = new E2EGlobalSetup(configFolders).execute;
export default e2eGlobalSetup;
