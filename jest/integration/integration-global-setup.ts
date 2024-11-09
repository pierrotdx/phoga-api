import { DockerService } from "../../docker";
import { JestGlobalManager } from "../jest-global-manager";
import { IConfigFolders } from "../models";

class IntGlobalSetup extends JestGlobalManager {
  constructor(configFolders: IConfigFolders) {
    super(configFolders);
  }

  actions = async (): Promise<void> => {
    await this.setupContainer(DockerService.Gcs);
    await this.setupContainer(DockerService.Mongo);
  };
}

const configFolders: IConfigFolders = {
  env: "/docker/tests",
  dockerConfig: "/docker/tests",
};
const intGlobalSetup = new IntGlobalSetup(configFolders).execute;
export default intGlobalSetup;
