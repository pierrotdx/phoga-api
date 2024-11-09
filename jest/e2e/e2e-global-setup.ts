import { JestGlobalManager } from "../jest-global-manager";
import { IConfigFolders } from "../models";

class E2eGlobalSetup extends JestGlobalManager {
  constructor(configFolders: IConfigFolders) {
    super(configFolders);
  }

  actions = async (): Promise<void> => {};
}

const configFolders: IConfigFolders = {
  env: "/jest/e2e",
};
const e2eGlobalSetup = new E2eGlobalSetup(configFolders).execute;
export default e2eGlobalSetup;
