import { EnvSetup, IJestConfigAction } from "../../core";

class Setup implements IJestConfigAction {
  constructor(private readonly envFolderPath: string) {}

  execute = async (globalConfig, projectConfig) => {
    const envSetup = new EnvSetup(projectConfig, this.envFolderPath);
    envSetup.setupEnvVariables();
  };
}

const envFolderPath = "./";
const setup = new Setup(envFolderPath).execute;
export default setup;
