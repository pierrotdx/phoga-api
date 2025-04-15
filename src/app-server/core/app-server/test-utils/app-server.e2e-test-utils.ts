import {
  ExpressPhotoTestUtils,
  IPhoto,
} from "#photo-context";
import { IUuidGenerator, UuidGenerator } from "#shared/uuid";
import { Response, Test } from "supertest";

import { AppServerSetupE2ETestUtils } from "./app-server.setup.e2e-test-utils";

export class AppServerTestUtils extends AppServerSetupE2ETestUtils {
  private expressSharedTestUtils: ExpressPhotoTestUtils;
  private readonly uuidGenerator: IUuidGenerator = new UuidGenerator();

  constructor(testEnv: any) {
    super(testEnv);
  }

  async globalBeforeEach(): Promise<void> {
    await this.setupDbs();
    this.testUtilsFactory();
  }

  private testUtilsFactory() {
    this.expressSharedTestUtils = new ExpressPhotoTestUtils();
  }

  async globalAfterEach(): Promise<void> {
    await this.closeAppServer();
  }

  async globalAfterAll(): Promise<void> {
    await this.closeMongoConnection();
  }

  async getToken(): Promise<string> {
    return await this.tokenProvider.getToken({
      username: this.username,
      password: this.password,
      audience: this.audience,
    });
  }

  getPayloadFromPhoto(photo: IPhoto) {
    return this.expressSharedTestUtils.getPayloadFromPhoto(photo);
  }

  addFormDataToReq(req: Test, photo: IPhoto): void {
    this.expressSharedTestUtils.addFormDataToReq(req, photo);
  }

  getPhotoFromResponse(res: Response): IPhoto {
    return this.expressSharedTestUtils.getPhotoFromResponse(res);
  }

  generateId(): string {
    return this.uuidGenerator.generate();
  }
}
