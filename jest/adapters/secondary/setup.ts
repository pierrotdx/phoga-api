import { EnvSetup, IJestConfigAction } from "../../core";

class Setup implements IJestConfigAction {
  execute = async (globalConfig, projectConfig) => {
    const envSetup = new EnvSetup(projectConfig);
    envSetup.setupEnvVariables();
    console.log("************* projectConfig", projectConfig);
  };
}

const setup = new Setup().execute;
export default setup;
