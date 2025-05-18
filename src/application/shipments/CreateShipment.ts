import { IShipmentRepository } from '@domain/shipments/IShipmentRepository';
import { IShipmentStatusRepository } from '@domain/shipments/IShipmentStatusRepository';
import { Shipment } from '@domain/entities/Shipment';
import { randomUUID } from 'crypto';

export class CreateShipment{
    constructor(
        private shipmentRepo: IShipmentRepository,
        private shipmentStatusRepo: IShipmentStatusRepository
    ){}

    async execute(item: Omit<Shipment, 'id' | 'created_at' | 'updated_at' | 'tracking_code' | 'destination_detail'>){
        const trackingCode = randomUUID().slice(0,8).toUpperCase();
        
        const shipment = await this.shipmentRepo.createShipment({...item, tracking_code: trackingCode});
        
        if (!shipment.id || !item.user_id) {
            throw new Error('No se pudo crear el estado inicial del envío: IDs inválidos');
        }
        
        await this.shipmentStatusRepo.createInitialStatus(shipment.id, item.user_id);
        
        return shipment;
    }
}