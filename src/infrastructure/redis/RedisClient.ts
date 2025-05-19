import { createClient, RedisClientType } from "redis";
import dotenv from "dotenv";

dotenv.config();

// Detectar si estamos en modo test
const isTestEnvironment = process.env.NODE_ENV === 'test';

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = process.env.REDIS_PORT || "6379";
const REDIS_URL = `redis://${REDIS_HOST}:${REDIS_PORT}`;

class RedisClientSingleton {
  private static instance: RedisClientSingleton;
  private client: RedisClientType;
  private isConnected: boolean = false;

  private constructor() {
    // Si estamos en entorno de pruebas, usamos un enfoque diferente
    if (isTestEnvironment) {
      this.client = createClient({
        url: REDIS_URL,
        socket: {
          reconnectStrategy: false // Desactivar reconexiones en pruebas
        }
      });
      
      // En pruebas, podemos suprimir los mensajes de registro
      this.client.on("error", (err) => {
        // Solo registrar en modo de depuración
        if (process.env.DEBUG) {
          console.error("Redis Client Error:", err);
        }
        this.isConnected = false;
      });
      
      this.client.on("connect", () => {
        if (process.env.DEBUG) {
          console.log("Redis Client Connected Successfully");
        }
        this.isConnected = true;
      });
    } else {
      // Configuración normal para entorno de producción/desarrollo
      this.client = createClient({
        url: REDIS_URL,
      });

      this.client.on("error", (err) => {
        console.error("Redis Client Error:", err);
        this.isConnected = false;
      });

      this.client.on("connect", () => {
        console.log("Redis Client Connected Successfully");
        this.isConnected = true;
      });

      this.client.on("reconnecting", () => {
        console.log("Redis Client Reconnecting...");
      });

      this.client.on("end", () => {
        console.log("Redis Client Connection Closed");
        this.isConnected = false;
      });
    }

    // En entorno de producción conectamos de inmediato
    // En tests, la conexión se manejará según sea necesario
    if (!isTestEnvironment) {
      this.connect();
    }
  }

  public static getInstance(): RedisClientSingleton {
    if (!RedisClientSingleton.instance) {
      RedisClientSingleton.instance = new RedisClientSingleton();
    }
    return RedisClientSingleton.instance;
  }

  public async connect(): Promise<void> {
    if (!this.isConnected) {
      try {
        await this.client.connect();
      } catch (error) {
        console.error("Failed to connect to Redis:", error);
        throw error;
      }
    }
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  public getClient(): RedisClientType {
    return this.client;
  }

  public isClientConnected(): boolean {
    return this.isConnected;
  }
}

// Obtener la instancia del singleton
const instance = RedisClientSingleton.getInstance();

// Exportar el cliente y el gestor
export const redisClient = instance.getClient();
export const redisManager = instance;

// Para los tests, usaremos un enfoque manual para cerrar la conexión
// En los archivos de test, se debe llamar a redisManager.disconnect() en afterAll

export default redisClient;
