import { IShipmentStatusCacheRepository } from "@domain/shipments/IShipmentStatusCacheRepository";
import { redisClient } from "./RedisClient";

export class ShipmentStatusRedisRepository
  implements IShipmentStatusCacheRepository
{
  private readonly TTL = 3600; 

  async cacheLatestStatus(
    trackingCode: string,
    statusData: {
      id: number;
      shipment_id: number;
      status: string;
      comment?: string;
      timestamp: Date;
      created_by: number;
      user_name?: string;
    }
  ): Promise<void> {
    const serializedData = {
      ...statusData,
      timestamp:
        statusData.timestamp instanceof Date
          ? statusData.timestamp.toISOString()
          : statusData.timestamp,
    };

    await redisClient.set(
      `shipment:status:${trackingCode}`,
      JSON.stringify(serializedData),
      { EX: this.TTL }
    );
  }

  async getLatestStatusFromCache(trackingCode: string): Promise<{
    id: number;
    shipment_id: number;
    status: string;
    comment?: string;
    timestamp: Date;
    created_by: number;
    user_name?: string;
  } | null> {
    const data = await redisClient.get(`shipment:status:${trackingCode}`);
    if (!data) return null;

    const parsedData = JSON.parse(data);

    return {
      ...parsedData,
      timestamp: new Date(parsedData.timestamp),
    };
  }

  async cacheStatusHistory(
    trackingCode: string,
    historyData: Array<{
      id: number;
      shipment_id: number;
      status: string;
      comment?: string;
      timestamp: Date;
      created_by: number;
      user_name?: string;
    }>
  ): Promise<void> {
    const serializedData = historyData.map((item) => ({
      ...item,
      timestamp:
        item.timestamp instanceof Date
          ? item.timestamp.toISOString()
          : item.timestamp,
    }));

    await redisClient.set(
      `shipment:history:${trackingCode}`,
      JSON.stringify(serializedData),
      { EX: this.TTL }
    );
  }

  async getStatusHistoryFromCache(trackingCode: string): Promise<Array<{
    id: number;
    shipment_id: number;
    status: string;
    comment?: string;
    timestamp: Date;
    created_by: number;
    user_name?: string;
  }> | null> {
    const data = await redisClient.get(`shipment:history:${trackingCode}`);
    if (!data) return null;

    const parsedData = JSON.parse(data);

    return parsedData.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp),
    }));
  }

  async invalidateCache(trackingCode: string): Promise<void> {
    await redisClient.del(`shipment:status:${trackingCode}`);
    await redisClient.del(`shipment:history:${trackingCode}`);
  }
}
