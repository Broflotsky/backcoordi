import { IBaseRepository } from '../../../domain/repositories/IBaseRepository';
import pool from '../../../config/database';

/**
 * Base PostgreSQL repository implementation
 */
export abstract class BaseRepository<T> implements IBaseRepository<T> {
  protected readonly tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async findAll(): Promise<T[]> {
    const { rows } = await pool.query(`SELECT * FROM ${this.tableName}`);
    return rows as T[];
  }

  async findById(id: string | number): Promise<T | null> {
    const { rows } = await pool.query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
    return rows.length > 0 ? (rows[0] as T) : null;
  }

  abstract create(item: Omit<T, 'id'>): Promise<T>;
  abstract update(id: string | number, item: Partial<T>): Promise<T | null>;
  
  async delete(id: string | number): Promise<boolean> {
    const { rowCount } = await pool.query(`DELETE FROM ${this.tableName} WHERE id = $1`, [id]);
    return rowCount > 0;
  }
}
