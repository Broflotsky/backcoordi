import { ShipmentAssignment } from '@domain/entities/ShipmentAssignment';
import { IShipmentAssignmentRepository } from '@domain/shipments/IShipmentAssignmentRepository';
import { Pool } from 'pg';

export class ShipmentAssignmentPostgresRepository implements IShipmentAssignmentRepository {
  constructor(private pool: Pool) {}

  async createAssignment(assignment: ShipmentAssignment): Promise<ShipmentAssignment> {
    const query = `
      INSERT INTO shipment_assignments (
        shipment_id, route_id, transporter_id, admin_id, 
        assigned_at, notes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      assignment.shipment_id,
      assignment.route_id,
      assignment.transporter_id || null,
      assignment.admin_id,
      assignment.assigned_at || new Date(),
      assignment.notes || null
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async findById(id: number): Promise<ShipmentAssignment | null> {
    const query = `
      SELECT sa.*, 
        s.tracking_code, s.recipient_name, s.weight_grams,
        r.estimated_time, r.distance,
        o.name as origin_name, d.name as destination_name,
        t.name as transporter_name, t.vehicle_type,
        u.first_name as admin_first_name, u.last_name as admin_last_name
      FROM shipment_assignments sa
      JOIN shipments s ON sa.shipment_id = s.id
      JOIN routes r ON sa.route_id = r.id
      JOIN locations o ON r.origin_id = o.id
      JOIN locations d ON r.destination_id = d.id
      LEFT JOIN transporters t ON sa.transporter_id = t.id
      JOIN users u ON sa.admin_id = u.id
      WHERE sa.id = $1
    `;

    const result = await this.pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapToAssignmentWithRelations(result.rows[0]);
  }

  async findByShipmentId(shipmentId: number): Promise<ShipmentAssignment[]> {
    const query = `
      SELECT sa.*, 
        s.tracking_code, s.recipient_name, s.weight_grams,
        r.estimated_time, r.distance,
        o.name as origin_name, d.name as destination_name,
        t.name as transporter_name, t.vehicle_type,
        u.first_name as admin_first_name, u.last_name as admin_last_name
      FROM shipment_assignments sa
      JOIN shipments s ON sa.shipment_id = s.id
      JOIN routes r ON sa.route_id = r.id
      JOIN locations o ON r.origin_id = o.id
      JOIN locations d ON r.destination_id = d.id
      LEFT JOIN transporters t ON sa.transporter_id = t.id
      JOIN users u ON sa.admin_id = u.id
      WHERE sa.shipment_id = $1
      ORDER BY sa.assigned_at DESC
    `;

    const result = await this.pool.query(query, [shipmentId]);
    return result.rows.map(row => this.mapToAssignmentWithRelations(row));
  }

  async findByRouteId(routeId: number): Promise<ShipmentAssignment[]> {
    const query = `
      SELECT sa.*, 
        s.tracking_code, s.recipient_name, s.weight_grams,
        r.estimated_time, r.distance,
        o.name as origin_name, d.name as destination_name,
        t.name as transporter_name, t.vehicle_type,
        u.first_name as admin_first_name, u.last_name as admin_last_name
      FROM shipment_assignments sa
      JOIN shipments s ON sa.shipment_id = s.id
      JOIN routes r ON sa.route_id = r.id
      JOIN locations o ON r.origin_id = o.id
      JOIN locations d ON r.destination_id = d.id
      LEFT JOIN transporters t ON sa.transporter_id = t.id
      JOIN users u ON sa.admin_id = u.id
      WHERE sa.route_id = $1
      ORDER BY sa.assigned_at DESC
    `;

    const result = await this.pool.query(query, [routeId]);
    return result.rows.map(row => this.mapToAssignmentWithRelations(row));
  }

  async findByTransporterId(transporterId: number): Promise<ShipmentAssignment[]> {
    const query = `
      SELECT sa.*, 
        s.tracking_code, s.recipient_name, s.weight_grams,
        r.estimated_time, r.distance,
        o.name as origin_name, d.name as destination_name,
        t.name as transporter_name, t.vehicle_type,
        u.first_name as admin_first_name, u.last_name as admin_last_name
      FROM shipment_assignments sa
      JOIN shipments s ON sa.shipment_id = s.id
      JOIN routes r ON sa.route_id = r.id
      JOIN locations o ON r.origin_id = o.id
      JOIN locations d ON r.destination_id = d.id
      LEFT JOIN transporters t ON sa.transporter_id = t.id
      JOIN users u ON sa.admin_id = u.id
      WHERE sa.transporter_id = $1
      ORDER BY sa.assigned_at DESC
    `;

    const result = await this.pool.query(query, [transporterId]);
    return result.rows.map(row => this.mapToAssignmentWithRelations(row));
  }

  async markAsCompleted(id: number): Promise<ShipmentAssignment> {
    const query = `
      UPDATE shipment_assignments
      SET completed_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      throw new Error(`La asignación con ID ${id} no fue encontrada`);
    }

    return this.findById(id) as Promise<ShipmentAssignment>;
  }

  async getFiltered(filters: {
    route_id?: number;
    transporter_id?: number;
    completed?: boolean;
    from_date?: Date;
    to_date?: Date;
  }): Promise<ShipmentAssignment[]> {
    let conditions = [];
    const params: any[] = [];
    let paramCount = 1;

    if (filters.route_id !== undefined) {
      conditions.push(`sa.route_id = $${paramCount}`);
      params.push(filters.route_id);
      paramCount++;
    }

    if (filters.transporter_id !== undefined) {
      conditions.push(`sa.transporter_id = $${paramCount}`);
      params.push(filters.transporter_id);
      paramCount++;
    }

    if (filters.completed !== undefined) {
      conditions.push(filters.completed 
        ? `sa.completed_at IS NOT NULL` 
        : `sa.completed_at IS NULL`);
    }

    if (filters.from_date !== undefined) {
      conditions.push(`sa.assigned_at >= $${paramCount}`);
      params.push(filters.from_date);
      paramCount++;
    }

    if (filters.to_date !== undefined) {
      conditions.push(`sa.assigned_at <= $${paramCount}`);
      params.push(filters.to_date);
      paramCount++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT sa.*, 
        s.tracking_code, s.recipient_name, s.weight_grams,
        r.estimated_time, r.distance,
        o.name as origin_name, d.name as destination_name,
        t.name as transporter_name, t.vehicle_type,
        u.first_name as admin_first_name, u.last_name as admin_last_name
      FROM shipment_assignments sa
      JOIN shipments s ON sa.shipment_id = s.id
      JOIN routes r ON sa.route_id = r.id
      JOIN locations o ON r.origin_id = o.id
      JOIN locations d ON r.destination_id = d.id
      LEFT JOIN transporters t ON sa.transporter_id = t.id
      JOIN users u ON sa.admin_id = u.id
      ${whereClause}
      ORDER BY sa.assigned_at DESC
    `;

    const result = await this.pool.query(query, params);
    return result.rows.map(row => this.mapToAssignmentWithRelations(row));
  }

    private mapToAssignmentWithRelations(row: any): ShipmentAssignment {
    return {
      id: row.id,
      shipment_id: row.shipment_id,
      route_id: row.route_id,
      transporter_id: row.transporter_id,
      admin_id: row.admin_id,
      assigned_at: row.assigned_at,
      completed_at: row.completed_at,
      notes: row.notes,
      shipment: row.tracking_code ? {
        id: row.shipment_id,
        tracking_code: row.tracking_code,
        recipient_name: row.recipient_name,
        weight_grams: row.weight_grams
      } : undefined,
      route: {
        id: row.route_id,
        estimated_time: row.estimated_time,
        distance: row.distance,
        origin_name: row.origin_name,
        destination_name: row.destination_name
      },
      transporter: row.transporter_id ? {
        id: row.transporter_id,
        name: row.transporter_name,
        vehicle_type: row.vehicle_type
      } : undefined,
      admin: {
        id: row.admin_id,
        first_name: row.admin_first_name,
        last_name: row.admin_last_name
      }
    };
  }
}
