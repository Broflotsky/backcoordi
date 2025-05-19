import { ShipmentAssignment } from '@domain/entities/ShipmentAssignment';

export interface IShipmentAssignmentRepository {
  createAssignment(assignment: ShipmentAssignment): Promise<ShipmentAssignment>;
  findById(id: number): Promise<ShipmentAssignment | null>;
  findByShipmentId(shipmentId: number): Promise<ShipmentAssignment[]>;
  findByRouteId(routeId: number): Promise<ShipmentAssignment[]>;
  findByTransporterId(transporterId: number): Promise<ShipmentAssignment[]>;
  markAsCompleted(id: number): Promise<ShipmentAssignment>;
  getFiltered(filters: {
    route_id?: number;
    transporter_id?: number;
    completed?: boolean;
    from_date?: Date;
    to_date?: Date;
  }): Promise<ShipmentAssignment[]>;
}
