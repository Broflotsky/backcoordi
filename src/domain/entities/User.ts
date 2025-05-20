export interface User {
    id?: number;
    first_name: string;
    last_name: string;
    email: string;
    password_hash: string;
    role_id: number;
    address?: string;
    created_at?: Date;
    updated_at?: Date;   
    role?: {
        id: number;
        name: string;
    }
}