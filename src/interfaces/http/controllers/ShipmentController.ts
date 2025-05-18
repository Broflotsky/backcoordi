import {Request, Response} from 'express';
import { CreateShipment } from '@application/shipments/CreateShipment';
import { ShipmentPostgresRepository } from '@infrastructure/db/postgres/ShipmentPostgresRepository';
import { ShipmentStatusPostgresRepository } from '@infrastructure/db/postgres/ShipmentStatusPostgresRepository';
import { UserPostgresRepository } from '@infrastructure/db/postgres/UserPostgresRepository';
import { EmailService } from '@infrastructure/notifications/EmailService';

export const createShipment = async (req:Request, res:Response) => {
    const user = (req as any).user;
    const shipmentRepo = new ShipmentPostgresRepository();
    const statusRepo = new ShipmentStatusPostgresRepository();
    const userRepo = new UserPostgresRepository();
    const emailService = new EmailService();
    
    const createShipment = new CreateShipment(
        shipmentRepo, 
        statusRepo, 
        userRepo, 
        emailService
    );

    try {
        const result = await createShipment.execute({...req.body, user_id: user.id})
        res.status(201).json(result)
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({error: error.message})
        } else {
            res.status(400).json({error: 'Error desconocido al crear el envío'})
        }
    }
}