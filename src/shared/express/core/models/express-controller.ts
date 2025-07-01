import { ErrorWithStatus, HttpErrorCode } from "#shared/models";
import { Handler, type Request, type Response } from "express";

import { wrapWithErrorCatcher } from "../error-catcher.service";

export interface IExpressController {
  handler: Handler;
}

export abstract class ExpressController<TReqParams>
  implements IExpressController
{
  private readonly internalHandler = async (req: Request, res: Response) => {
    const params = await this.getParams(req);
    const result = await this.executeUseCase(params);
    this.sendResponse(res, result);
  };

  readonly handler = wrapWithErrorCatcher(this.internalHandler);

  protected abstract getParamsFromRequest(
    req: Request,
  ): TReqParams | Promise<TReqParams>;

  protected abstract executeUseCase(...args: unknown[]): Promise<unknown>;

  protected abstract sendResponse(res: Response, ...args: unknown[]): void;

  private async getParams(req: Request): Promise<unknown> {
    try {
      const params = await this.getParamsFromRequest(req);
      return params;
    } catch (err) {
      const error = err.status
        ? err
        : new ErrorWithStatus(err, HttpErrorCode.BadRequest);
      throw error;
    }
  }
}
