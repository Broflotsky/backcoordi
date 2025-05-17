/**
 * Script para inicializar la base de datos PostgreSQL
 * Ejecuta el archivo init.sql que contiene la definición de tablas y datos iniciales
 */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Ruta al archivo SQL de inicialización
const sqlFilePath = path.join(__dirname, '../src/infrastructure/db/postgres/schema/init.sql');

// Lee el archivo SQL
const initSql = fs.readFileSync(sqlFilePath, { encoding: 'utf-8' });

// Función para ejecutar la inicialización
async function initializeDatabase() {
  // Crear un cliente PostgreSQL usando las variables de entorno
  const client = new Client({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || '5432',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'cleanarchdb',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // Conectar al servidor
    await client.connect();
    console.log('Conectado a PostgreSQL');
    
    // Ejecutar el script SQL de inicialización
    console.log('Ejecutando script de inicialización de base de datos...');
    await client.query(initSql);
    
    console.log('Inicialización completada exitosamente.');
    
  } catch (err) {
    console.error('Error durante la inicialización de la base de datos:', err);
    process.exit(1);
  } finally {
    // Cerrar la conexión al finalizar
    await client.end();
    console.log('Conexión cerrada');
  }
}

// Ejecutar la función de inicialización
initializeDatabase();
