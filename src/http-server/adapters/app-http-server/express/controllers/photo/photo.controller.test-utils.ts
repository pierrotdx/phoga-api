import { Express } from "express";

import {
  IPhotoImageDb,
  IPhotoMetadataDb,
  IUseCases,
  UseCasesFactory,
} from "@domain";
import { FakeValidatorsFactory, ParsersFactory } from "@http-server";

import { ControllersTestUtils } from "../controllers.shared-test-utils";
import { PhotoController } from "./photo.controller";

export class PhotoControllerTestUtils {
  private controllersTestUtils: ControllersTestUtils;
  private photoController: PhotoController;
  private useCases: IUseCases;

  constructor(
    public readonly photoMetadataDb: IPhotoMetadataDb,
    public readonly photoImageDb: IPhotoImageDb,
  ) {
    this.testUtilsFactory();
  }

  internalSetup() {
    this.setPhotoController();
  }

  private testUtilsFactory() {
    this.controllersTestUtils = new ControllersTestUtils();
  }

  private setPhotoController() {
    this.useCases = new UseCasesFactory(
      this.photoMetadataDb,
      this.photoImageDb,
    ).create();
    const validators = new FakeValidatorsFactory().create();
    const parsers = new ParsersFactory().create();
    this.photoController = new PhotoController(
      this.useCases,
      validators,
      parsers,
    );
  }

  getPhotoController(): PhotoController {
    return this.photoController;
  }

  getApp(): Express {
    return this.controllersTestUtils.generateDumbApp();
  }

  getUseCases(): IUseCases {
    return this.useCases;
  }
}
