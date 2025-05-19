import { IShipmentStatusRepository } from "@domain/shipments/IShipmentStatusRepository";
import { IShipmentRepository } from "@domain/shipments/IShipmentRepository";
import { IShipmentStatusCacheRepository } from "@domain/shipments/IShipmentStatusCacheRepository";

export class CachedShipmentStatusRepository
  implements IShipmentStatusRepository
{
  constructor(
    private readonly baseRepository: IShipmentStatusRepository,
    private readonly shipmentRepository: IShipmentRepository,
    private readonly cacheRepository: IShipmentStatusCacheRepository
  ) {}

  async createInitialStatus(shipmentId: number, userId: number): Promise<void> {
    await this.baseRepository.createInitialStatus(shipmentId, userId);

    const shipment = await this.shipmentRepository.findById(shipmentId);
    if (shipment && shipment.tracking_code) {
      await this.cacheRepository.invalidateCache(shipment.tracking_code);
    }
  }

  async createStatus(status: {
    shipment_id: number;
    status: string;
    comment?: string;
    created_by: number;
  }): Promise<void> {
    await this.baseRepository.createStatus(status);

    const shipment = await this.shipmentRepository.findById(status.shipment_id);
    if (shipment && shipment.tracking_code) {
      await this.cacheRepository.invalidateCache(shipment.tracking_code);
    }
  }

  async getLatestStatus(shipmentId: number): Promise<{
    id: number;
    shipment_id: number;
    status: string;
    comment?: string;
    timestamp: Date;
    created_by: number;
    user_name?: string;
  }> {
    try {
      const shipment = await this.shipmentRepository.findById(shipmentId);

      if (!shipment || !shipment.tracking_code) {
        return this.baseRepository.getLatestStatus(shipmentId);
      }

      const cachedStatus = await this.cacheRepository.getLatestStatusFromCache(
        shipment.tracking_code
      );

      if (cachedStatus) {
        console.log(`Cache hit for shipment status: ${shipment.tracking_code}`);
        return cachedStatus;
      }

      console.log(`Cache miss for shipment status: ${shipment.tracking_code}`);
      const status = await this.baseRepository.getLatestStatus(shipmentId);

      if (status) {
        await this.cacheRepository.cacheLatestStatus(
          shipment.tracking_code,
          status
        );
      }

      return status;
    } catch (error) {
      console.error(
        "Error en CachedShipmentStatusRepository.getLatestStatus:",
        error
      );
      return this.baseRepository.getLatestStatus(shipmentId);
    }
  }

  async getStatusHistory(shipmentId: number): Promise<
    Array<{
      id: number;
      shipment_id: number;
      status: string;
      comment?: string;
      timestamp: Date;
      created_by: number;
      user_name?: string;
    }>
  > {
    try {
      const shipment = await this.shipmentRepository.findById(shipmentId);

      if (!shipment || !shipment.tracking_code) {
        return this.baseRepository.getStatusHistory(shipmentId);
      }

      const cachedHistory =
        await this.cacheRepository.getStatusHistoryFromCache(
          shipment.tracking_code
        );

      if (cachedHistory) {
        console.log(
          `Cache hit for shipment history: ${shipment.tracking_code}`
        );
        return cachedHistory;
      }

      console.log(`Cache miss for shipment history: ${shipment.tracking_code}`);
      const history = await this.baseRepository.getStatusHistory(shipmentId);

      if (history && history.length > 0) {
        await this.cacheRepository.cacheStatusHistory(
          shipment.tracking_code,
          history
        );
      }

      return history;
    } catch (error) {
      console.error(
        "Error en CachedShipmentStatusRepository.getStatusHistory:",
        error
      );
      return this.baseRepository.getStatusHistory(shipmentId);
    }
  }
}
