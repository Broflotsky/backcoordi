import request from 'supertest';
import app from '../../../../app';
import dotenv from 'dotenv';
import path from 'path';
import db, { initTestDatabase, cleanTestDatabase } from '@config/database.test';
import jwt from 'jsonwebtoken';
import { redisManager } from '../../../../infrastructure/redis/RedisClient';

dotenv.config({ path: path.resolve(__dirname, '../../../../../.env.test') });

describe('Shipment Routes', () => {
  const testUser = {
    id: 999,
    email: 'test.user@example.com',
    role_id: 2
  };

  const validToken = jwt.sign(testUser, process.env.JWT_SECRET || 'test_secret');
  
  const validShipment = {
    origin_id: 1,
    destination_id: 2,
    product_type_id: 1,
    weight_grams: 500,
    dimensions: '30x20x5 cm',
    recipient_name: 'Juan Pérez',
    recipient_address: 'Calle 123 #45-67, Apto 101',
    recipient_phone: '3001234567',
    recipient_document: '1234567890'
  };

  beforeAll(async () => {
    await initTestDatabase();
  });
  afterAll(async () => {
    await cleanTestDatabase();
    await db.end();
    await redisManager.disconnect();
  });

  describe('POST /api/v1/shipments', () => {
    test('debería crear un nuevo envío con token válido y generar su estado inicial', async () => {
      const response = await request(app)
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${validToken}`)
        .send(validShipment)
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('tracking_code');
      expect(response.body.origin_id).toBe(validShipment.origin_id);
      expect(response.body.destination_id).toBe(validShipment.destination_id);
      expect(response.body.weight_grams).toBe(validShipment.weight_grams);
      
      const shipmentId = response.body.id;
      const statusResult = await db.query(
        'SELECT * FROM shipment_status_history WHERE shipment_id = $1', 
        [shipmentId]
      );
      
      expect(statusResult.rows.length).toBe(1);
      
      const statusRecord = statusResult.rows[0];
      expect(statusRecord.status).toBe('En espera');
      expect(statusRecord.created_by).toBe(testUser.id);
      expect(response.body.recipient_name).toBe(validShipment.recipient_name);
    });

    test('debería retornar 401 sin token de autenticación', async () => {
      const response = await request(app)
        .post('/api/v1/shipments')
        .send(validShipment)
        .expect(401);
      
      expect(response.body).toHaveProperty('error');
    });
    
    test('debería retornar 403 con token inválido', async () => {
      const response = await request(app)
        .post('/api/v1/shipments')
        .set('Authorization', 'Bearer invalid_token')
        .send(validShipment)
        .expect(403);
      
      expect(response.body).toHaveProperty('error');
    });

    test('debería retornar 400 con campos inválidos', async () => {
      const invalidShipment = {
        origin_id: 1,
      };

      const response = await request(app)
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${validToken}`)
        .send(invalidShipment)
        .expect(400);
      
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });
});
