export interface ShipmentAssignment {
  id?: number;
  shipment_id: number;
  route_id: number;
  transporter_id?: number;  
  admin_id: number;
  assigned_at?: Date;
  completed_at?: Date;
  notes?: string;
  
  shipment?: {
    id: number;
    tracking_code: string;
    recipient_name: string;
    weight_grams: number;
  };
  route?: {
    id: number;
    estimated_time: string;
    distance: number;
    origin_name?: string;
    destination_name?: string;
  };
  transporter?: {
    id: number;
    name: string;
    vehicle_type: string;
  };
  admin?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}
