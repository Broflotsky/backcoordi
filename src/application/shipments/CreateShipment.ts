import { IShipmentRepository } from '@domain/shipments/IShipmentRepository';
import { Shipment } from '@domain/entities/Shipment';
import { randomUUID } from 'crypto';

export class CreateShipment{
    constructor(private shipmentRepo: IShipmentRepository){}

    async execute(item: Omit<Shipment, 'id' | 'created_at' | 'updated_at' | 'tracking_code' | 'destination_detail'>){
        const trackingCode = randomUUID().slice(0,8).toUpperCase();
        const shipment = await this.shipmentRepo.createShipment({...item, tracking_code: trackingCode});
        return shipment;
    }
}