import dotenv from "dotenv";
import path from "path";

import { IEnvSetup } from "./models";

export class EnvSetup implements IEnvSetup {
  private env: any;

  constructor(
    private readonly projectConfig: any,
    envFolder: string,
  ) {
    this.setEnv(envFolder);
  }

  private setEnv(envFolder: string) {
    const folder = path.join(this.projectConfig.rootDir, envFolder);
    dotenv.config({ path: `${folder}/.env` });
    this.env = process.env;
  }

  setupEnvVariables = () => {
    if (!this.env) {
      return;
    }
    this.projectConfig.globals.__MONGO_URL__ = this.env.MONGO_URL;
    this.projectConfig.globals.__MONGO_DB_NAME__ = this.env.MONGO_DB;
    this.projectConfig.globals.__MONGO_PHOTO_BASE_COLLECTION__ =
      this.env.MONGO_PHOTO_BASE_COLLECTION;
    this.projectConfig.globals.__MONGO_TAG_COLLECTION__ =
      this.env.MONGO_TAG_COLLECTION;

    this.projectConfig.globals.__GCS_API_ENDPOINT__ = this.env.GCS_API_ENDPOINT;
    this.projectConfig.globals.__GCS_PROJECT_ID__ = this.env.GCS_PROJECT_ID;
    this.projectConfig.globals.__GOOGLE_APPLICATION_CREDENTIALS__ =
      this.env.GOOGLE_APPLICATION_CREDENTIALS;
    this.projectConfig.globals.__GC_PHOTO_IMAGES_BUCKET__ =
      this.env.GC_PHOTO_IMAGES_BUCKET;

    this.projectConfig.globals.__OAUTH2_AUTHORIZATION_SERVER_DOMAIN__ =
      this.env.OAUTH2_AUTHORIZATION_SERVER_DOMAIN;
    this.projectConfig.globals.__OAUTH2_CLIENT_ID__ = this.env.OAUTH2_CLIENT_ID;
    this.projectConfig.globals.__OAUTH2_CLIENT_SECRET__ =
      this.env.OAUTH2_CLIENT_SECRET;
    this.projectConfig.globals.__OAUTH2_AUDIENCE__ = this.env.OAUTH2_AUDIENCE;
    this.projectConfig.globals.__OAUTH2_USER_NAME__ = this.env.OAUTH2_USER_NAME;
    this.projectConfig.globals.__OAUTH2_USER_PASSWORD__ =
      this.env.OAUTH2_USER_PASSWORD;
  };
}
