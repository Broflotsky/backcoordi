import { validationResult } from "express-validator";
import { NextFunction, Request, Response } from 'express';

export const validation = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({errors: errors.array()});
    next();
}