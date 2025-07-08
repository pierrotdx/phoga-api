import {
  AddPhotoUseCase,
  IAddPhotoParams,
  IAddPhotoUseCase,
  IDeletePhotoParams,
  IGetPhotoParams,
  IPhoto,
  IPhotoData,
  IReplacePhotoParams,
  ISearchPhotoParams,
  Photo,
  PhotoEntryPointId,
} from "#photo-context";
import { ISearchResult } from "#shared/models";
import {
  ExpressPhotoTestUtils,
  expectedImageUrl,
  parseTagDates,
} from "#shared/test-utils";
import { IUuidGenerator, UuidGenerator } from "#shared/uuid";
import request, { Response, Test } from "supertest";

import {
  addPhotoPath,
  photoEntryPoints,
  searchPhotoPath,
} from "./app-server.paths.e2e-test-utils";
import { AppServerSetupE2ETestUtils } from "./app-server.setup.e2e-test-utils";

export class AppServerTestUtils extends AppServerSetupE2ETestUtils {
  private expressSharedTestUtils: ExpressPhotoTestUtils;
  private readonly uuidGenerator: IUuidGenerator = new UuidGenerator();
  private addPhotoUseCase: IAddPhotoUseCase;

  private readonly photoImagesBucket: string;
  private readonly photoDbApiEndpoint: string;

  constructor(testEnv: any) {
    super(testEnv);
    this.photoImagesBucket = testEnv.__GC_PHOTO_IMAGES_BUCKET__;
    this.photoDbApiEndpoint = testEnv.__GCS_API_ENDPOINT__;
  }

  async globalBeforeEach(): Promise<void> {
    await this.setupDbs();
    this.onDbsSetup();
  }

  private onDbsSetup(): void {
    this.testUtilsFactory();
  }

  private testUtilsFactory() {
    this.expressSharedTestUtils = new ExpressPhotoTestUtils();
    this.addPhotoUseCase = new AddPhotoUseCase(
      this.photoDataDb,
      this.photoImageDb,
      this.tagDb,
    );
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

  addFormDataToReq(req: Test, addPhotoParams: IAddPhotoParams): void {
    this.expressSharedTestUtils.addFormDataToReq(req, addPhotoParams);
  }

  getPhotoFromResponse(res: Response): IPhoto {
    return this.expressSharedTestUtils.getPhotoFromResponse(res);
  }

  getPhotosFromSearchResponse(res: Response): ISearchResult<IPhoto> {
    const searchResult = res.body as ISearchResult<IPhoto>;
    const photosWithStringDates = searchResult.hits || ([] as IPhoto[]);
    const photos = photosWithStringDates.map((photo) => {
      if (photo.metadata?.date) {
        photo.metadata.date = new Date(photo.metadata.date);
      }
      if (photo.tags) {
        photo.tags.forEach((t) => parseTagDates(t));
      }
      const photoData: IPhotoData = {
        _id: photo._id,
        metadata: photo.metadata,
        tags: photo.tags,
        imageUrl: photo.imageUrl,
      };
      const imageBuffer = photo.imageBuffer
        ? Buffer.from(photo.imageBuffer)
        : undefined;
      return new Photo(photo._id, { imageBuffer, photoData });
    });
    return { ...searchResult, hits: photos };
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

  async sendSearchPhotoReq(
    searchPhotoParams: ISearchPhotoParams,
  ): Promise<Test> {
    const req = request(this.appServer.app).get(searchPhotoPath);
    if (searchPhotoParams?.filter?.tagId) {
      req.query({ tagId: searchPhotoParams?.filter?.tagId });
    }
    if (searchPhotoParams?.options?.dateOrder) {
      req.query({ dateOrder: searchPhotoParams.options.dateOrder });
    }
    if (typeof searchPhotoParams?.options?.size === "number") {
      req.query({ size: searchPhotoParams.options.size });
    }
    if (searchPhotoParams?.options?.from) {
      req.query({ from: searchPhotoParams.options.from });
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

  async addPhoto(params: IAddPhotoParams): Promise<void> {
    await this.addPhotoUseCase.execute(params);
  }

  getExpectedImageUrl = (id: IPhoto["_id"]): string =>
    expectedImageUrl({
      apiBaseUrl: this.photoDbApiEndpoint,
      bucket: this.photoImagesBucket,
      id,
    });
}
