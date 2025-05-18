import { IUserRepository } from "@domain/auth/IUserRepository";
import { User } from "@domain/entities/User";
import db from '@config/database';

/**
 * Implementación en PostgreSQL del repositorio de usuarios
 */
export class UserPostgresRepository implements IUserRepository {
  /**
   * Encuentra un usuario por su ID
   * @param id ID del usuario a buscar
   * @returns Promesa con el usuario encontrado o null si no existe
   */
  async findById(id: number): Promise<User | null> {
    try {
      const query = `
        SELECT u.*, r.name as role_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = $1
      `;
      
      const result = await db.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const user = result.rows[0];
      return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        password_hash: user.password_hash,
        role_id: user.role_id,
        address: user.address,
        created_at: user.created_at,
        updated_at: user.updated_at,
        role: {
          id: user.role_id,
          name: user.role_name
        }
      };
    } catch (error) {
      console.error('Error al buscar usuario por ID:', error);
      return null;
    }
  }
}
