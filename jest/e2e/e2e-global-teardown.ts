import { JestGlobalManager } from "../jest-global-manager";
import { IConfigFolders } from "../models";

class E2eGlobalTeardown extends JestGlobalManager {
  constructor(configFolders: IConfigFolders) {
    super(configFolders);
  }

  actions = async (): Promise<void> => {};
}

const configFolders: IConfigFolders = {
  env: "./.env",
};
const intGlobalTeardown = new E2eGlobalTeardown(configFolders).execute;
export default intGlobalTeardown;
