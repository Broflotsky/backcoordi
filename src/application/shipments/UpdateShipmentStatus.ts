import { IShipmentStatusRepository } from "@domain/shipments/IShipmentStatusRepository";
import { IShipmentRepository } from "@domain/shipments/IShipmentRepository";
import { ITransporterRepository } from "@domain/shipments/ITransporterRepository";
import { IShipmentAssignmentRepository } from "@domain/shipments/IShipmentAssignmentRepository";

export class UpdateShipmentStatus {
  constructor(
    private statusRepository: IShipmentStatusRepository,
    private shipmentRepository: IShipmentRepository,
    private transporterRepository: ITransporterRepository,
    private assignmentRepository: IShipmentAssignmentRepository
  ) {}

  async execute(
    shipmentId: number,
    newStatus: string,
    adminId: number,
    comment?: string
  ) {
    const validStatuses = ["En espera", "En transito", "Entregado"];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(
        `Estado inválido. Los valores permitidos son: ${validStatuses.join(
          ", "
        )}`
      );
    }

    const shipment = await this.shipmentRepository.findById(shipmentId);
    if (!shipment) {
      throw new Error(`Envío con ID ${shipmentId} no encontrado`);
    }

    const currentStatus = await this.statusRepository.getLatestStatus(
      shipmentId
    );

    if (currentStatus.status === newStatus) {
      throw new Error(`El envío ya se encuentra en estado ${newStatus}`);
    }

    if (currentStatus.status === "Entregado") {
      throw new Error(
        "No se puede modificar el estado de un envío ya entregado"
      );
    }

    if (newStatus === "Entregado") {
      try {
        const assignments = await this.assignmentRepository.findByShipmentId(
          shipmentId
        );

        if (
          assignments &&
          assignments.length > 0 &&
          assignments[0].transporter_id
        ) {
          const transporterId = assignments[0].transporter_id;

          await this.transporterRepository.restoreAvailableCapacity(
            transporterId,
            shipment.weight_grams
          );
        }
      } catch (error: unknown) {
        let errorMessage = "Error desconocido";

        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        } else if (error !== null && typeof error === "object") {
          errorMessage = String(error);
        }

        console.error(
          `Error al actualizar capacidad del transportista: ${errorMessage}`
        );
      }
    }

    await this.statusRepository.createStatus({
      shipment_id: shipmentId,
      status: newStatus,
      comment: comment || `Estado actualizado a ${newStatus}`,
      created_by: adminId,
    });

    return await this.statusRepository.getLatestStatus(shipmentId);
  }
}
