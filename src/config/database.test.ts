import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Cargar variables de entorno de prueba
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// Configuración de la base de datos de prueba
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

// Método para inicializar la base de datos de prueba
export const initTestDatabase = async () => {
  try {
    // Crear tabla de roles si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insertar roles si no existen
    await pool.query(`
      INSERT INTO roles (id, name) 
      VALUES (1, 'admin'), (2, 'user')
      ON CONFLICT (id) DO NOTHING;
    `);

    // Crear tabla de usuarios si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(100) NOT NULL,
        role_id INTEGER REFERENCES roles(id),
        address VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Base de datos de prueba inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar la base de datos de prueba:', error);
    throw error;
  }
};

// Método para limpiar la base de datos
export const cleanTestDatabase = async () => {
  try {
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['user.test.%']);
    console.log('Datos de prueba eliminados correctamente');
  } catch (error) {
    console.error('Error al limpiar la base de datos de prueba:', error);
    throw error;
  }
};

export default pool;
