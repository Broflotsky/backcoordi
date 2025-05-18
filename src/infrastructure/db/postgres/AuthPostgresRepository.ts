import { IAuthRepository } from "@domain/auth/IAuthRepository";
import { User } from "@domain/entities/User";
import db from '@config/database';

export class AuthPostgresRepository implements IAuthRepository {
 
    async findByEmail(email:string): Promise<User | null>{
        const query = `
      SELECT u.*, r.id as role_id, r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.email = $1
    `;

        const res = await db.query(query, [email]);
        const row = res.rows[0];
        if (!row) return null

        return {
            id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      password_hash: row.password_hash,
      role_id: row.role_id,
      address: row.address,
      created_at: row.created_at,
      updated_at: row.updated_at,
      role: {
        id: row.role_id,
        name: row.role_name,
      },
    };
        }

    

    async createUser(user: User): Promise<User>{
    const res = await db.query(`
        INSERT INTO users (first_name, last_name, email, password_hash, role_id, address)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        user.first_name,
        user.last_name,
        user.email,
        user.password_hash,
        user.role_id,
        user.address,
      ]);
  
      return res.rows[0];
    }

}


