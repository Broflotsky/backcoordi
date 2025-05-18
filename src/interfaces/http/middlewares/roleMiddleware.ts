import { NextFunction, Request, Response } from "express";

export const roleMiddleware = (role: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        if(user.role !== role) return res.status(403).json({error: 'No estas autorizado.'});
        next();
    }
}
