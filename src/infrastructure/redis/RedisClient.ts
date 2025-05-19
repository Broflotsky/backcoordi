import { createClient, RedisClientType } from "redis";
import dotenv from "dotenv";

dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = process.env.REDIS_PORT || "6379";
const REDIS_URL = `redis://${REDIS_HOST}:${REDIS_PORT}`;

class RedisClientSingleton {
  private static instance: RedisClientSingleton;
  private client: RedisClientType;
  private isConnected: boolean = false;

  private constructor() {
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

    this.connect();
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

export const redisClient = RedisClientSingleton.getInstance().getClient();

export const redisManager = RedisClientSingleton.getInstance();

export default redisClient;
