import { teardownMongoContainer } from "../mongo/mongo-docker-manager";

export default async function (globalConfig, projectConfig) {
  const configRepo = `${projectConfig.rootDir}/mongo/mongo-tests`;
  await teardownMongoContainer(configRepo);
}
