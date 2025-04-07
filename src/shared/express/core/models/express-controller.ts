import { Handler, type Request, type Response } from "express";

import { wrapWithErrorCatcher } from "../error-catcher.service";

export interface IExpressController {
  handler: Handler;
}

export abstract class ExpressController implements IExpressController {
  private readonly internalHandler = async (req: Request, res: Response) => {
    const params = await this.getParamsFromRequest(req);
    const result = await this.executeUseCase(params);
    this.sendResponse(res, result);
  };
  readonly handler = wrapWithErrorCatcher(this.internalHandler);
  protected abstract getParamsFromRequest(
    req: Request,
  ): unknown | Promise<unknown>;
  protected abstract executeUseCase(...args: unknown[]): Promise<unknown>;
  protected abstract sendResponse(res: Response, ...args: unknown[]): void;
}
