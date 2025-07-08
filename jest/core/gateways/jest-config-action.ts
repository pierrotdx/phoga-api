export interface IJestConfigAction {
  execute: (globalConfig, projectConfig) => Promise<void>;
}
