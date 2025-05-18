import { IShipmentRepository } from '@domain/shipments/IShipmentRepository';
import { IRouteRepository } from '@domain/shipments/IRouteRepository';
import { ITransporterRepository } from '@domain/shipments/ITransporterRepository';
import { IShipmentAssignmentRepository } from '@domain/shipments/IShipmentAssignmentRepository';
import { IShipmentStatusRepository } from '@domain/shipments/IShipmentStatusRepository';
import { IEmailService } from '@domain/notifications/IEmailService';
import { IUserRepository } from '@domain/auth/IUserRepository';
import { ShipmentAssignment } from '@domain/entities/ShipmentAssignment';

export class AssignShipmentToRoute {
  constructor(
    private shipmentRepo: IShipmentRepository,
    private routeRepo: IRouteRepository,
    private transporterRepo: ITransporterRepository,
    private assignmentRepo: IShipmentAssignmentRepository,
    private statusRepo: IShipmentStatusRepository,
    private emailService: IEmailService,
    private userRepo: IUserRepository
  ) {}

  async execute(data: {
    shipment_id: number;
    route_id: number;
    transporter_id?: number;
    admin_id: number;
    notes?: string;
  }): Promise<ShipmentAssignment> {
    // Validar que el envío exista
    const shipment = await this.shipmentRepo.findById(data.shipment_id);
    if (!shipment) {
      throw new Error('El envío no existe');
    }

    // Validar que la ruta exista
    const route = await this.routeRepo.findById(data.route_id);
    if (!route) {
      throw new Error('La ruta no existe');
    }

    // Validar que el transportista exista y esté disponible (si se proporciona)
    if (data.transporter_id) {
      const transporter = await this.transporterRepo.findById(data.transporter_id);
      if (!transporter) {
        throw new Error('El transportista no existe');
      }
      if (!transporter.available) {
        throw new Error('El transportista no está disponible');
      }
      if (transporter.available_capacity < shipment.weight_grams) {
        throw new Error('El transportista no tiene capacidad disponible suficiente para este envío');
      }
    }

    // Verificar que el envío no esté ya asignado
    const existingAssignments = await this.assignmentRepo.findByShipmentId(data.shipment_id);
    const pendingAssignment = existingAssignments.find(a => !a.completed_at);
    if (pendingAssignment) {
      throw new Error('El envío ya está asignado a una ruta');
    }

    // Crear la asignación
    const assignment: ShipmentAssignment = {
      shipment_id: data.shipment_id,
      route_id: data.route_id,
      transporter_id: data.transporter_id,
      admin_id: data.admin_id,
      notes: data.notes,
      assigned_at: new Date()
    };

    // Guardar la asignación
    const createdAssignment = await this.assignmentRepo.createAssignment(assignment);

    // Actualizar el estado del envío a "En transito"
    await this.statusRepo.createStatus({
      shipment_id: data.shipment_id,
      status: 'En transito',
      comment: `Asignado a la ruta ${route.origin?.name || route.origin_id} - ${route.destination?.name || route.destination_id}`,
      created_by: data.admin_id
    });

    // Si se asignó transportista, reducir su capacidad disponible
    if (data.transporter_id) {
      const updatedTransporter = await this.transporterRepo.reduceAvailableCapacity(data.transporter_id, shipment.weight_grams);
      
      // Si la capacidad disponible quedó en cero o muy baja, marcar como no disponible
      if (updatedTransporter.available_capacity < 100) { // Umbral mínimo (100 gramos)
        await this.transporterRepo.updateAvailability(data.transporter_id, false);
      }
    }

    // Enviar notificación por email al usuario sobre la asignación
    try {
      const user = await this.userRepo.findById(shipment.user_id);
      if (user && user.email) {
        await this.emailService.sendShipmentAssignmentNotification(
          user.email,
          shipment.tracking_code || '',
          route.origin?.name || `Origen ID: ${route.origin_id}`,
          route.destination?.name || `Destino ID: ${route.destination_id}`,
          route.estimated_time || 'No disponible'
        );
      }
    } catch (error) {
      console.error('Error al enviar notificación de asignación:', error);
      // No detenemos el flujo principal si falla la notificación
    }

    return createdAssignment;
  }
}
