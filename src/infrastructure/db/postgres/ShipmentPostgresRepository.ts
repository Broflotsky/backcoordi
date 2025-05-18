import {IShipmentRepository} from "@domain/shipments/IShipmentRepository";
import { Shipment } from "@domain/entities/Shipment";
import db from '@config/database'

export class ShipmentPostgresRepository implements IShipmentRepository{
    async createShipment(item: Shipment): Promise<Shipment> {

        const query = `
            INSERT INTO shipments (user_id, origin_id, destination_id, destination_detail, product_type_id, weight_grams, dimensions, recipient_name, recipient_address, recipient_phone, recipient_document, tracking_code)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `
        const res = await db.query(query, [
            item.user_id,
            item.origin_id,
            item.destination_id,
            item.destination_detail,
            item.product_type_id,
            item.weight_grams,
            item.dimensions,
            item.recipient_name,
            item.recipient_address,
            item.recipient_phone,
            item.recipient_document,
            item.tracking_code
        ]);
        
        return res.rows[0];
    }
    
}