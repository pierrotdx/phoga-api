import { Logger } from "@logger";

import { IUseCases } from "../business-logic";
import { IValidators } from "./models/validators";

export abstract class PhogaHttpServer {
  constructor(useCases: IUseCases, validators: IValidators, logger: Logger) {}
  listen: (port: number) => void;
  close: () => void;
}
