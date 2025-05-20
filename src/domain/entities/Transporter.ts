export interface Transporter {
  id?: number;
  name: string;
  vehicle_type: string;
  capacity: number;         
  available_capacity: number; 
  available: boolean;       
  created_at?: Date;
  updated_at?: Date;
}
