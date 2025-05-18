export interface Shipment {
 id?:number;
 user_id:number;
 origin_id:number;
 destination_id:number;
 destination_detail?:string;
 product_type_id:number;
 weight_grams:number;
 dimensions:string;
 recipient_name:string;
 recipient_address:string;
 recipient_phone:string;
 recipient_document:string;
 tracking_code?:string;
 created_at?:Date;
 updated_at?:Date;
}