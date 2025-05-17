/**
 * Base Data Transfer Object (DTO) interface
 * DTOs are used to transfer data between layers of the application
 */
export interface BaseDTO {
  id?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
