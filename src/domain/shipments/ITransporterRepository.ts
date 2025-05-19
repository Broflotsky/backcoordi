import { Transporter } from "@domain/entities/Transporter";

export interface ITransporterRepository {
  findById(id: number): Promise<Transporter | null>;
  getAll(): Promise<Transporter[]>;
  getAvailable(requiredCapacity: number): Promise<Transporter[]>;
  updateAvailability(id: number, available: boolean): Promise<Transporter>;
  reduceAvailableCapacity(id: number, weight: number): Promise<Transporter>;
  restoreAvailableCapacity(id: number, weight: number): Promise<Transporter>;
}
