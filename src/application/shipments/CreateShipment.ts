import { IShipmentRepository } from '@domain/shipments/IShipmentRepository';
import { IShipmentStatusRepository } from '@domain/shipments/IShipmentStatusRepository';
import { IUserRepository } from '@domain/auth/IUserRepository';
import { IEmailService } from '@domain/notifications/IEmailService';
import { Shipment } from '@domain/entities/Shipment';
import { randomUUID } from 'crypto';

export class CreateShipment{
    constructor(
        private shipmentRepo: IShipmentRepository,
        private shipmentStatusRepo: IShipmentStatusRepository,
        private userRepo: IUserRepository,
        private emailService: IEmailService
    ){}

    async execute(item: Omit<Shipment, 'id' | 'created_at' | 'updated_at' | 'tracking_code' | 'destination_detail'>){
        const trackingCode = randomUUID().slice(0,8).toUpperCase();
        
        const shipment = await this.shipmentRepo.createShipment({...item, tracking_code: trackingCode});
        
        if (!shipment.id || !item.user_id) {
            throw new Error('No se pudo crear el estado inicial del envío: IDs inválidos');
        }
        
        await this.shipmentStatusRepo.createInitialStatus(shipment.id, item.user_id);
        
        try {
            const user = await this.userRepo.findById(item.user_id);
            
            if (user && user.email) {
                    this.emailService.sendShipmentCreationNotification(
                    user.email,
                    trackingCode,
                    item.recipient_name
                ).catch(error => {
                    console.error('Error al enviar notificación de envío:', error);
                });
            }
        } catch (error) {
            console.error('Error al obtener datos de usuario para notificación:', error);
        }
        
        return shipment;
    }
}