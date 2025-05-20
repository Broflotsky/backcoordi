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

    // Crear tabla de ciudades si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        zone VARCHAR(100),
        latitude DECIMAL(9,6),
        longitude DECIMAL(9,6),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name, department)
      );
    `);

    // Crear tabla de tipos de productos si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        min_weight_grams INTEGER,
        max_weight_grams INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear tabla de envíos si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shipments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        origin_id INTEGER REFERENCES cities(id),
        destination_id INTEGER REFERENCES cities(id),
        destination_detail TEXT,
        product_type_id INTEGER REFERENCES product_types(id),
        weight_grams INTEGER NOT NULL CHECK (weight_grams > 0),
        dimensions TEXT NOT NULL,
        recipient_name VARCHAR(200) NOT NULL,
        recipient_address TEXT NOT NULL,
        recipient_phone VARCHAR(20) NOT NULL,
        recipient_document VARCHAR(30) NOT NULL,
        tracking_code VARCHAR(30) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Crear tabla de historial de estados de envíos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shipment_status_history (
        id SERIAL PRIMARY KEY,
        shipment_id INTEGER NOT NULL REFERENCES shipments(id),
        status VARCHAR(50) NOT NULL,
        comment TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER REFERENCES users(id),
        CONSTRAINT check_valid_status CHECK (status IN ('En espera', 'En transito', 'Entregado'))
      );
    `);
    
    // Insertar datos de prueba adicionales necesarios para los tests
    await pool.query(`
      -- Insertar roles básicos si no existen
      INSERT INTO roles (id, name) 
      VALUES (1, 'admin'), (2, 'user')
      ON CONFLICT (id) DO NOTHING;
      
      -- Insertar usuario de prueba para los tests
      INSERT INTO users (id, first_name, last_name, email, password_hash, role_id)
      VALUES 
        (999, 'Test', 'User', 'test.user@example.com', '$2b$10$xVNUjAiO/xl8CQ/PFSGw5.x8F/BhAXvM8FDK01NeER9TaN4rPwj9a', 2)
      ON CONFLICT (id) DO NOTHING;
      
      -- Asegurar que existan las ciudades necesarias para pruebas
      INSERT INTO cities (id, name, department) 
      VALUES 
        (1, 'Bogotá', 'Cundinamarca'),
        (2, 'Medellín', 'Antioquia'),
        (3, 'Cali', 'Valle del Cauca')
      ON CONFLICT (id) DO NOTHING;
      
      -- Asegurar que existan los tipos de productos necesarios para pruebas
      INSERT INTO product_types (id, name, description, min_weight_grams, max_weight_grams)
      VALUES 
        (1, 'Sobre', 'Documentos y envíos pequeños', 0, 1000),
        (2, 'Paquete', 'Envíos medianos', 1001, 20000),
        (3, 'Paquete pesado', 'Envíos grandes', 20001, 999999)
      ON CONFLICT (id) DO NOTHING;
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
