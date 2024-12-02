import { Express } from "express";

import {
  IPhoto,
  IPhotoImageDb,
  IPhotoMetadataDb,
  IUseCases,
  UseCasesFactory,
} from "@domain";
import { ParsersFactory } from "@http-server/adapters/parsers";
import { FakeValidatorsFactory } from "@http-server/adapters/validators";
import { DbsTestUtils } from "@shared";

import { ControllersTestUtils } from "../controllers.shared-test-utils";
import { AdminPhotoController } from "./admin-photo.controller";

export class AdminPhotoControllerTestUtils {
  private controllersTestUtils: ControllersTestUtils;
  private dbsTestUtils: DbsTestUtils;

  private adminPhotoController: AdminPhotoController;
  private useCases: IUseCases;

  constructor(
    public readonly photoMetadataDb: IPhotoMetadataDb,
    public readonly photoImageDb: IPhotoImageDb,
  ) {
    this.testUtilsFactory();
  }

  internalSetup() {
    this.setAdminPhotoController();
  }

  private testUtilsFactory() {
    this.controllersTestUtils = new ControllersTestUtils();
    this.dbsTestUtils = new DbsTestUtils(
      this.photoMetadataDb,
      this.photoImageDb,
    );
  }

  private setAdminPhotoController() {
    this.useCases = new UseCasesFactory(
      this.photoMetadataDb,
      this.photoImageDb,
    ).create();
    const validators = new FakeValidatorsFactory().create();
    const parsers = new ParsersFactory().create();

    this.adminPhotoController = new AdminPhotoController(
      this.useCases,
      validators,
      parsers,
    );
  }

  getAdminPhotoController(): AdminPhotoController {
    return this.adminPhotoController;
  }

  getApp(): Express {
    return this.controllersTestUtils.generateDumbApp();
  }

  getUseCases(): IUseCases {
    return this.useCases;
  }

  async insertPhotoInDbs(photo: IPhoto): Promise<void> {
    await this.dbsTestUtils.insertPhotoInDbs(photo);
  }

  getPayloadFromPhoto(photo: IPhoto) {
    return this.controllersTestUtils.getPayloadFromPhoto(photo);
  }
}
