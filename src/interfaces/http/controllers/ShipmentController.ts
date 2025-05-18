import {Request, Response} from 'express';
import { CreateShipment } from '@application/shipments/CreateShipment';
import { ShipmentPostgresRepository } from '@infrastructure/db/postgres/ShipmentPostgresRepository';

export const createShipment = async (req:Request, res:Response) => {
    const user = (req as any).user;
    const repo = new ShipmentPostgresRepository();
    const createShipment = new CreateShipment(repo);

    try {
        const result = await createShipment.execute({...req.body, user_id: user.id})
        res.status(200).json(result)
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({error: error.message})
        } else {
            res.status(400).json({error: 'Error desconocido al crear el envío'})
        }
    }
}