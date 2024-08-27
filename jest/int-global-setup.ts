import dotenv from "dotenv";

import { DockerService, setupContainer } from "../docker";

const setGlobalVariables = (projectConfig: any, configRepo: string) => {
  dotenv.config({ path: `${configRepo}/.env` });

  const username = process.env.MONGO_INITDB_ROOT_USERNAME;
  const password = process.env.MONGO_INITDB_ROOT_PASSWORD;
  projectConfig.globals.__MONGO_URL__ = `mongodb://${username}:${password}@localhost:27017`;
  projectConfig.globals.__MONGO_DB_NAME__ = process.env.MONGO_DB;
};

export default async function (globalConfig, projectConfig) {
  const configRepo = `${projectConfig.rootDir}/docker/tests`;
  await setupContainer(DockerService.Gcs, configRepo);
  await setupContainer(DockerService.Mongo, configRepo);
  setGlobalVariables(projectConfig, configRepo);
}
