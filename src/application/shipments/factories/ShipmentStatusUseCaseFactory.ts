import { GetShipmentStatus } from "@application/shipments/GetShipmentStatus";
import { GetShipmentStatusHistory } from "@application/shipments/GetShipmentStatusHistory";
import { UpdateShipmentStatus } from "@application/shipments/UpdateShipmentStatus";
import { ShipmentStatusRepositoryFactory } from "@infrastructure/factories/ShipmentStatusRepositoryFactory";
import { ShipmentPostgresRepository } from "@infrastructure/db/postgres/ShipmentPostgresRepository";
import { TransporterPostgresRepository } from "@infrastructure/db/postgres/TransporterPostgresRepository";
import { ShipmentAssignmentPostgresRepository } from "@infrastructure/db/postgres/ShipmentAssignmentPostgresRepository";

export class ShipmentStatusUseCaseFactory {
  static createGetShipmentStatusUseCase(): GetShipmentStatus {
    const shipmentRepository = new ShipmentPostgresRepository();
    const shipmentStatusRepository =
      ShipmentStatusRepositoryFactory.createWithCache();

    return new GetShipmentStatus(shipmentStatusRepository, shipmentRepository);
  }

  static createGetShipmentStatusHistoryUseCase(): GetShipmentStatusHistory {
    const shipmentRepository = new ShipmentPostgresRepository();
    const shipmentStatusRepository =
      ShipmentStatusRepositoryFactory.createWithCache();

    return new GetShipmentStatusHistory(
      shipmentStatusRepository,
      shipmentRepository
    );
  }

  static createUpdateShipmentStatusUseCase(): UpdateShipmentStatus {
    const shipmentRepository = new ShipmentPostgresRepository();
    const shipmentStatusRepository =
      ShipmentStatusRepositoryFactory.createWithCache();
    const transporterRepository = new TransporterPostgresRepository();
    const assignmentRepository = new ShipmentAssignmentPostgresRepository();

    return new UpdateShipmentStatus(
      shipmentStatusRepository,
      shipmentRepository,
      transporterRepository,
      assignmentRepository
    );
  }
}
