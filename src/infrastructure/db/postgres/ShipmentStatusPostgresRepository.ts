import { IShipmentStatusRepository } from "@domain/shipments/IShipmentStatusRepository";
import db from "@config/database";

export class ShipmentStatusPostgresRepository
  implements IShipmentStatusRepository
{
  async createInitialStatus(shipmentId: number, userId: number): Promise<void> {
    const query = `
      INSERT INTO shipment_status_history 
      (shipment_id, status, comment, created_by)
      VALUES ($1, $2, $3, $4)
    `;

    await db.query(query, [
      shipmentId,
      "En espera",
      "Envío registrado en el sistema",
      userId,
    ]);
  }

  async createStatus(status: {
    shipment_id: number;
    status: string;
    comment?: string;
    created_by: number;
  }): Promise<void> {
    const query = `
      INSERT INTO shipment_status_history 
      (shipment_id, status, comment, created_by)
      VALUES ($1, $2, $3, $4)
    `;

    await db.query(query, [
      status.shipment_id,
      status.status,
      status.comment || null,
      status.created_by,
    ]);
  }

  async getLatestStatus(shipmentId: number) {
    const query = `
      SELECT ssh.*, CONCAT(u.first_name, ' ', u.last_name) as user_name
      FROM shipment_status_history ssh
      LEFT JOIN users u ON ssh.created_by = u.id
      WHERE ssh.shipment_id = $1
      ORDER BY ssh.timestamp DESC
      LIMIT 1
    `;

    const result = await db.query(query, [shipmentId]);

    if (result.rows.length === 0) {
      throw new Error(
        `No se encontró ningún estado para el envío con ID ${shipmentId}`
      );
    }

    return {
      id: result.rows[0].id,
      shipment_id: result.rows[0].shipment_id,
      status: result.rows[0].status,
      comment: result.rows[0].comment,
      timestamp: result.rows[0].timestamp,
      created_by: result.rows[0].created_by,
      user_name: result.rows[0].user_name,
    };
  }

  async getStatusHistory(shipmentId: number) {
    const query = `
      SELECT ssh.*, CONCAT(u.first_name, ' ', u.last_name) as user_name
      FROM shipment_status_history ssh
      LEFT JOIN users u ON ssh.created_by = u.id
      WHERE ssh.shipment_id = $1
      ORDER BY ssh.timestamp DESC
    `;

    const result = await db.query(query, [shipmentId]);

    return result.rows.map((row) => ({
      id: row.id,
      shipment_id: row.shipment_id,
      status: row.status,
      comment: row.comment,
      timestamp: row.timestamp,
      created_by: row.created_by,
      user_name: row.user_name,
    }));
  }
}
