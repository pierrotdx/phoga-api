import { JestGlobalTeardown } from "./utils";

const configRelativePath = "/docker/tests";
const intGlobalTeardown = new JestGlobalTeardown(configRelativePath).execute;
export default intGlobalTeardown;
