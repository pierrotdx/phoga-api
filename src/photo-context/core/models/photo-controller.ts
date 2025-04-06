import { Request, Response } from "express";

export interface IPhotoController {
  getMetadata(req: Request, res: Response): Promise<void>;
  getImage(req: Request, res: Response): Promise<void>;
  search(req: Request, res: Response): Promise<void>;
}
