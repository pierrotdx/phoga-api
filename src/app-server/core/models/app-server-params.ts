import { ILogger } from "@logger-context";
import { IParsers, IUseCases, IValidators } from "@photo-context";

export interface AppHttpServerParams {
  useCases: IUseCases;
  validators: IValidators;
  parsers: IParsers;
  logger: ILogger;
}
