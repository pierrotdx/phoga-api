import {
  IAddPhotoParams,
  IDeletePhotoParams,
  IGetPhotoParams,
  IPhoto,
  IPhotoData,
  IReplacePhotoParams,
  ISearchPhotoParams,
  Photo,
  PhotoEntryPointId,
} from "#photo-context";
import { IUuidGenerator, UuidGenerator } from "#shared/uuid";
import request, { Response, Test } from "supertest";

import {
  addPhotoPath,
  photoEntryPoints,
  searchPhotoPath,
} from "./app-server.paths.e2e-test-utils";
import { AppServerSetupE2ETestUtils } from "./app-server.setup.e2e-test-utils";
import { ExpressPhotoTestUtils } from "#shared/test-utils";

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

  getPhotosFromSearchResponse(res: Response): IPhoto[] {
    const photosWithStringDates = res.body as IPhoto[];
    const photos = photosWithStringDates.map((photo) => {
      if (photo.metadata?.date) {
        photo.metadata.date = new Date(photo.metadata.date);
      }
      const photoData: IPhotoData = {
        _id: photo._id,
        metadata: photo.metadata,
      };
      const imageBuffer = photo.imageBuffer
        ? Buffer.from(photo.imageBuffer)
        : undefined;
      return new Photo(photo._id, { imageBuffer, photoData });
    });
    return photos;
  }

  generateId(): string {
    return this.uuidGenerator.generate();
  }

  async sendAddPhotoReq(params: {
    addPhotoParams: IAddPhotoParams;
    withToken: boolean;
  }): Promise<Test> {
    const { addPhotoParams, withToken } = { ...params };
    const req = request(this.appServer.app).post(addPhotoPath);
    if (withToken) {
      await this.addTokenToRequest(req);
    }
    this.addFormDataToReq(req, addPhotoParams);
    return req;
  }

  async sendGetPhotoDataReq(getPhotoParams: IGetPhotoParams): Promise<Test> {
    const url = photoEntryPoints.getFullPathWithParams(
      PhotoEntryPointId.GetPhotoData,
      { id: getPhotoParams },
    );
    return request(this.appServer.app).get(url);
  }

  async sendGetPhotoImageReq(getPhotoParams: IGetPhotoParams): Promise<Test> {
    const url = photoEntryPoints.getFullPathWithParams(
      PhotoEntryPointId.GetPhotoImage,
      { id: getPhotoParams },
    );
    return request(this.appServer.app).get(url);
  }

  async sendSearchPhotoReq(
    searchPhotoParams: ISearchPhotoParams,
  ): Promise<Test> {
    const req = request(this.appServer.app).get(searchPhotoPath);
    if (searchPhotoParams?.rendering) {
      req.query(searchPhotoParams.rendering);
    }
    if (searchPhotoParams?.excludeImages) {
      req.query({ excludeImages: searchPhotoParams.excludeImages });
    }
    return req;
  }

  async sendReplacePhotoReq(params: {
    replacePhotoParams: IReplacePhotoParams;
    withToken: boolean;
  }): Promise<Test> {
    const { replacePhotoParams, withToken } = { ...params };
    const url = photoEntryPoints.getFullPathWithParams(
      PhotoEntryPointId.ReplacePhoto,
      { id: replacePhotoParams._id },
    );

    const req = request(this.appServer.app).put(url);
    this.addFormDataToReq(req, replacePhotoParams);
    if (withToken) {
      await this.addTokenToRequest(req);
    }

    return req;
  }

  async sendDeletePhotoReq(params: {
    deletePhotoParams: IDeletePhotoParams;
    withToken: boolean;
  }): Promise<Test> {
    const { deletePhotoParams, withToken } = { ...params };
    const url = photoEntryPoints.getFullPathWithParams(
      PhotoEntryPointId.DeletePhoto,
      { id: deletePhotoParams },
    );

    const req = request(this.appServer.app).delete(url);

    if (withToken) {
      await this.addTokenToRequest(req);
    }

    return req;
  }

  private async addTokenToRequest(req: Test): Promise<void> {
    const token = await this.getToken();
    req.auth(token, { type: "bearer" });
  }
}
