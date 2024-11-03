import { JestGlobalManager } from "../jest-global-manager";

class E2EGlobalSetup extends JestGlobalManager {
  constructor(configRelativePath: string) {
    super(configRelativePath);
  }
}

const configRelativePath = "./.env";
const e2eGlobalSetup = new E2EGlobalSetup(configRelativePath).execute;
export default e2eGlobalSetup;
