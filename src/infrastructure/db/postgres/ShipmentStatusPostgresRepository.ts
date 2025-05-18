import { IShipmentStatusRepository } from '@domain/shipments/IShipmentStatusRepository';
import db from '@config/database';


export class ShipmentStatusPostgresRepository implements IShipmentStatusRepository {
  async createInitialStatus(shipmentId: number, userId: number): Promise<void> {
    const query = `
      INSERT INTO shipment_status_history 
      (shipment_id, status, comment, created_by)
      VALUES ($1, $2, $3, $4)
    `;
    
    await db.query(query, [
      shipmentId, 
      'En espera', 
      'Envío registrado en el sistema', 
      userId
    ]);
  }
}
