import { IShipmentRepository } from '@domain/shipments/IShipmentRepository';
import { IShipmentAssignmentRepository } from '@domain/shipments/IShipmentAssignmentRepository';
import { Shipment } from '@domain/entities/Shipment';

export class GetPendingShipments {
  constructor(
    private shipmentRepo: IShipmentRepository,
    private assignmentRepo: IShipmentAssignmentRepository
  ) {}

  async execute(): Promise<Shipment[]> {
    const pendingShipments = await this.shipmentRepo.findByStatus('En espera');
    
    if (pendingShipments.length === 0) {
      return [];
    }

    const pendingIds = pendingShipments.map(shipment => shipment.id!);
    const assignmentPromises = pendingIds.map(id => 
      this.assignmentRepo.findByShipmentId(id)
    );
    
    const assignmentsResults = await Promise.all(assignmentPromises);
    
    const result = pendingShipments.filter((shipment, index) => {
      const shipmentAssignments = assignmentsResults[index];
      const hasActiveAssignment = shipmentAssignments.some(a => !a.completed_at);
      return !hasActiveAssignment;
    });

    return result;
  }

  async getAllShipments(status?: string): Promise<Shipment[]> {
    if (status) {
      return this.shipmentRepo.findByStatus(status);
    }
    return this.shipmentRepo.getAll();
  }
}
