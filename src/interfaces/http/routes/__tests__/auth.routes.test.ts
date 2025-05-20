import request from 'supertest';
import app from '../../../../app';
import dotenv from 'dotenv';
import path from 'path';
import db, { initTestDatabase, cleanTestDatabase } from '@config/database.test';
import { redisManager } from '../../../../infrastructure/redis/RedisClient';

dotenv.config({ path: path.resolve(__dirname, '../../../../../.env.test') });

describe('Auth Routes', () => {
  const testUser = {
    first_name: 'Usuario',
    last_name: 'Test',
    email: `user.test.${Date.now()}@example.com`,
    password: 'password123',
    address: 'Dirección de Prueba 123'
  };

  // Inicializar la base de datos antes de ejecutar los tests
  beforeAll(async () => {
    await initTestDatabase();
  });

  afterAll(async () => {
    await cleanTestDatabase();
    await db.end();
    await redisManager.disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    test('debería registrar un nuevo usuario correctamente', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).toHaveProperty('first_name', testUser.first_name);
      expect(response.body).not.toHaveProperty('password_hash');
    });

    test('no debería permitir email repetido', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('ya esta registrado');
    });

    test('no debería permitir campos faltantes', async () => {
      const incompleteUser = {
        first_name: 'Incompleto',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(incompleteUser)
        .expect(400);
      
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    test('debería retornar un JWT si las credenciales son válidas', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.split('.').length).toBe(3);
    });

    test('debería fallar con credenciales inválidas', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'contraseñaIncorrecta'
        })
        .expect(401);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('inválidas');
    });

    test('debería fallar con usuario inexistente', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'noexiste@ejemplo.com',
          password: 'cualquierContraseña'
        })
        .expect(401);
      
      expect(response.body).toHaveProperty('error');
    });

    test('debería fallar si faltan campos', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          password: testUser.password
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
      
      const response2 = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
        })
        .expect(400);
      
      expect(response2.body).toHaveProperty('errors');
    });
  });
});
