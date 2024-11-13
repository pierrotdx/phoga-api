import { Express } from "express";

import { ParsersFactory } from "@adapters";
import { FakeValidatorsFactory } from "@adapters/validators";
import {
  IPhoto,
  IPhotoImageDb,
  IPhotoMetadataDb,
  IUseCases,
  UseCasesFactory,
} from "@business-logic";
import { DbsTestUtils } from "@utils";

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
    this.dbsTestUtils = new DbsTestUtils();
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
