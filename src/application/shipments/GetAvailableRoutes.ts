import { IRouteRepository } from '@domain/shipments/IRouteRepository';
import { Route } from '@domain/entities/Route';

export class GetAvailableRoutes {
  constructor(
    private routeRepo: IRouteRepository
  ) {}

  async execute(filters?: { origin_id?: number, destination_id?: number }): Promise<Route[]> {
    if (filters) {
      return this.routeRepo.getFiltered(filters);
    }
    return this.routeRepo.getAll();
  }
 
  async getRouteById(id: number): Promise<Route | null> {
    return this.routeRepo.findById(id);
  }

  async getRouteByLocations(originId: number, destinationId: number): Promise<Route | null> {
    return this.routeRepo.findByLocations(originId, destinationId);
  }
}
