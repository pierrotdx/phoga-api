import { JestGlobalSetup } from "./utils";

const configRelativePath = "/docker/tests";
const intGlobalSetup = new JestGlobalSetup(configRelativePath).execute;
export default intGlobalSetup;
