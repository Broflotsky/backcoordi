import { Route } from '@domain/entities/Route';
import { IRouteRepository } from '@domain/shipments/IRouteRepository';
import { Pool } from 'pg';

export class RoutePostgresRepository implements IRouteRepository {
  constructor(private pool: Pool) {}

  async findById(id: number): Promise<Route | null> {
    const query = `
      SELECT r.*, 
        o.name as origin_name, o.department as origin_department,
        d.name as destination_name, d.department as destination_department
      FROM routes r
      JOIN locations o ON r.origin_id = o.id
      JOIN locations d ON r.destination_id = d.id
      WHERE r.id = $1
    `;

    const result = await this.pool.query(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }

    const route = result.rows[0];
    return {
      ...route,
      origin: {
        id: route.origin_id,
        name: route.origin_name,
        department: route.origin_department
      },
      destination: {
        id: route.destination_id,
        name: route.destination_name,
        department: route.destination_department
      }
    };
  }

  async findByLocations(originId: number, destinationId: number): Promise<Route | null> {
    const query = `
      SELECT r.*, 
        o.name as origin_name, o.department as origin_department,
        d.name as destination_name, d.department as destination_department
      FROM routes r
      JOIN locations o ON r.origin_id = o.id
      JOIN locations d ON r.destination_id = d.id
      WHERE r.origin_id = $1 AND r.destination_id = $2
    `;

    const result = await this.pool.query(query, [originId, destinationId]);
    if (result.rows.length === 0) {
      return null;
    }

    const route = result.rows[0];
    return {
      ...route,
      origin: {
        id: route.origin_id,
        name: route.origin_name,
        department: route.origin_department
      },
      destination: {
        id: route.destination_id,
        name: route.destination_name,
        department: route.destination_department
      }
    };
  }

  async getAll(): Promise<Route[]> {
    const query = `
      SELECT r.*, 
        o.name as origin_name, o.department as origin_department,
        d.name as destination_name, d.department as destination_department
      FROM routes r
      JOIN locations o ON r.origin_id = o.id
      JOIN locations d ON r.destination_id = d.id
      ORDER BY o.name, d.name
    `;

    const result = await this.pool.query(query);
    
    return result.rows.map(route => ({
      ...route,
      origin: {
        id: route.origin_id,
        name: route.origin_name,
        department: route.origin_department
      },
      destination: {
        id: route.destination_id,
        name: route.destination_name,
        department: route.destination_department
      }
    }));
  }

  async getFiltered(filters: { origin_id?: number, destination_id?: number }): Promise<Route[]> {
    let conditions = [];
    const params: any[] = [];
    let paramCount = 1;

    if (filters.origin_id !== undefined) {
      conditions.push(`r.origin_id = $${paramCount}`);
      params.push(filters.origin_id);
      paramCount++;
    }

    if (filters.destination_id !== undefined) {
      conditions.push(`r.destination_id = $${paramCount}`);
      params.push(filters.destination_id);
      paramCount++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT r.*, 
        o.name as origin_name, o.department as origin_department,
        d.name as destination_name, d.department as destination_department
      FROM routes r
      JOIN locations o ON r.origin_id = o.id
      JOIN locations d ON r.destination_id = d.id
      ${whereClause}
      ORDER BY o.name, d.name
    `;

    const result = await this.pool.query(query, params);
    
    return result.rows.map(route => ({
      ...route,
      origin: {
        id: route.origin_id,
        name: route.origin_name,
        department: route.origin_department
      },
      destination: {
        id: route.destination_id,
        name: route.destination_name,
        department: route.destination_department
      }
    }));
  }
}
