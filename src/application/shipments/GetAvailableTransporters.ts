import { ITransporterRepository } from '@domain/shipments/ITransporterRepository';
import { Transporter } from '@domain/entities/Transporter';

export class GetAvailableTransporters {
  constructor(
    private transporterRepo: ITransporterRepository
  ) {}

  async execute(requiredCapacity?: number): Promise<Transporter[]> {
    if (requiredCapacity) {
      return this.transporterRepo.getAvailable(requiredCapacity);
    }
    
    const allTransporters = await this.transporterRepo.getAll();
    return allTransporters.filter(t => t.available && t.available_capacity > 0);
  }

  async getTransporterById(id: number): Promise<Transporter | null> {
    return this.transporterRepo.findById(id);
  }

  async getAllTransporters(): Promise<Transporter[]> {
    return this.transporterRepo.getAll();
  }
}
