import { IUseCases } from "@business-logic";
import { Logger } from "@logger";

import { IParsers, IValidators } from "./";

export interface AppHttpServerParams {
  useCases: IUseCases;
  validators: IValidators;
  parsers: IParsers;
  logger: Logger;
}
