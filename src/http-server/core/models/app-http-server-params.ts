import { IUseCases } from "@domain";
import { ILogger } from "@logger";

import { IParsers, IValidators } from "./";

export interface AppHttpServerParams {
  useCases: IUseCases;
  validators: IValidators;
  parsers: IParsers;
  logger: ILogger;
}
