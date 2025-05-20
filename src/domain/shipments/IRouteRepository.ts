import { Route } from '@domain/entities/Route';

export interface IRouteRepository {
  findById(id: number): Promise<Route | null>;
  findByLocations(originId: number, destinationId: number): Promise<Route | null>;
  getAll(): Promise<Route[]>;
  getFiltered(filters: { origin_id?: number, destination_id?: number }): Promise<Route[]>;
}
