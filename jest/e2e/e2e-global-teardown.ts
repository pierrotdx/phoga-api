import { JestGlobalManager } from "../jest-global-manager";

class E2EtGlobalTeardown extends JestGlobalManager {
  constructor(configRelativePath: string) {
    super(configRelativePath);
  }
}

const configRelativePath = "../.env.e2e";
const intGlobalTeardown = new E2EtGlobalTeardown(configRelativePath).execute;
export default intGlobalTeardown;
