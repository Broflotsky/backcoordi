import { Request, Response } from "express";
import { RegisterUser } from "@application/auth/RegisterUser";
import { LoginUser } from "@application/auth/LoginUser";
import { AuthPostgresRepository } from "@infrastructure/db/postgres/AuthPostgresRepository";

const repo = new AuthPostgresRepository();

export const registerController = async (req: Request, res: Response) => {
    const useCase = new RegisterUser(repo);    
    try {
        const result = await useCase.execute(req.body);
        res.status(201).json(result);
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({error: error.message});
        } else {
            res.status(400).json({error: 'Error desconocido'});
        }
    }
}

export const loginController = async (req: Request, res: Response) => {
    const useCase = new LoginUser(repo);    
    try {
        const { email, password } = req.body;
        const result = await useCase.execute(email, password);
        res.status(200).json(result);
    } catch (error) {
        if (error instanceof Error) {
            // Usar 401 para errores de credenciales inválidas
            const statusCode = error.message.includes('Credenciales inválidas') ? 401 : 400;
            res.status(statusCode).json({error: error.message});
        } else {
            res.status(400).json({error: 'Error desconocido'});
        }
    }
}
