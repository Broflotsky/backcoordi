export interface Route {
  id?: number;
  origin_id: number;
  destination_id: number;
  estimated_time: string; 
  distance: number;
  created_at?: Date;
  updated_at?: Date;
  
  origin?: {
    id: number;
    name: string;
    department: string;
  };
  destination?: {
    id: number;
    name: string;
    department: string;
  };
}
