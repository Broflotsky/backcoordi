import {Request, Response} from 'express';
import { CreateShipment } from '@application/shipments/CreateShipment';
import { ShipmentPostgresRepository } from '@infrastructure/db/postgres/ShipmentPostgresRepository';
import { ShipmentStatusPostgresRepository } from '@infrastructure/db/postgres/ShipmentStatusPostgresRepository';

export const createShipment = async (req:Request, res:Response) => {
    const user = (req as any).user;
    const shipmentRepo = new ShipmentPostgresRepository();
    const statusRepo = new ShipmentStatusPostgresRepository();
    const createShipment = new CreateShipment(shipmentRepo, statusRepo);

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