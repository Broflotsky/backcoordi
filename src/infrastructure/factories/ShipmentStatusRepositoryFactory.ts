import { IShipmentStatusRepository } from "@domain/shipments/IShipmentStatusRepository";
import { ShipmentStatusPostgresRepository } from "@infrastructure/db/postgres/ShipmentStatusPostgresRepository";
import { ShipmentPostgresRepository } from "@infrastructure/db/postgres/ShipmentPostgresRepository";
import { ShipmentStatusRedisRepository } from "@infrastructure/redis/ShipmentStatusRedisRepository";
import { CachedShipmentStatusRepository } from "@infrastructure/repositories/CachedShipmentStatusRepository";

export class ShipmentStatusRepositoryFactory {
  static createWithCache(): IShipmentStatusRepository {
    const baseRepository = new ShipmentStatusPostgresRepository();

    const shipmentRepository = new ShipmentPostgresRepository();

    const cacheRepository = new ShipmentStatusRedisRepository();

    return new CachedShipmentStatusRepository(
      baseRepository,
      shipmentRepository,
      cacheRepository
    );
  }

  static createBaseRepository(): IShipmentStatusRepository {
    return new ShipmentStatusPostgresRepository();
  }
}
