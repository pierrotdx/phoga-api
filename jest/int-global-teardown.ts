import { DockerService, teardownContainer } from "../docker";

export default async function (globalConfig, projectConfig) {
  const configRepo = `${projectConfig.rootDir}/docker/tests`;
  await teardownContainer(DockerService.Gcs, configRepo);
  await teardownContainer(DockerService.Mongo, configRepo);
}
