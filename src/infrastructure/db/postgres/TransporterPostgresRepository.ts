import { Transporter } from '@domain/entities/Transporter';
import { ITransporterRepository } from '@domain/shipments/ITransporterRepository';
import { Pool } from 'pg';

export class TransporterPostgresRepository implements ITransporterRepository {
  constructor(private pool: Pool) {}

  async findById(id: number): Promise<Transporter | null> {
    const query = `
      SELECT * FROM transporters
      WHERE id = $1
    `;

    const result = await this.pool.query(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0] as Transporter;
  }

  async getAll(): Promise<Transporter[]> {
    const query = `
      SELECT * FROM transporters
      ORDER BY name
    `;

    const result = await this.pool.query(query);
    return result.rows as Transporter[];
  }

  async getAvailable(requiredCapacity: number): Promise<Transporter[]> {
    const query = `
      SELECT * FROM transporters
      WHERE available = true AND available_capacity >= $1
      ORDER BY name
    `;

    const result = await this.pool.query(query, [requiredCapacity]);
    return result.rows as Transporter[];
  }

  async updateAvailability(id: number, available: boolean): Promise<Transporter> {
    const query = `
      UPDATE transporters
      SET available = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.pool.query(query, [id, available]);
    return result.rows[0] as Transporter;
  }

  async reduceAvailableCapacity(id: number, weight: number): Promise<Transporter> {
    const query = `
      UPDATE transporters
      SET available_capacity = GREATEST(0, available_capacity - $2),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.pool.query(query, [id, weight]);

    // Si la capacidad disponible llega a cero, marcamos como no disponible
    if (result.rows[0].available_capacity === 0) {
      await this.updateAvailability(id, false);
      result.rows[0].available = false;
    }

    return result.rows[0] as Transporter;
  }

  async restoreAvailableCapacity(id: number, weight: number): Promise<Transporter> {
    const transporter = await this.findById(id);
    if (!transporter) {
      throw new Error(`Transportista con ID ${id} no encontrado`);
    }

    const query = `
      UPDATE transporters
      SET available_capacity = LEAST(capacity, available_capacity + $2),
          available = true,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.pool.query(query, [id, weight]);
    return result.rows[0] as Transporter;
  }
}
