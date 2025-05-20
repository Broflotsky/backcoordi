import { IAuthRepository } from "@domain/auth/IAuthRepository";
import {hash} from "bcryptjs";

export class RegisterUser {
    constructor(private authRepository: IAuthRepository) {}
    
    async execute(input: {
        first_name: string;
        last_name: string;
        email: string;
        password: string;
        address?: string;
    }){
        const existingUser = await this.authRepository.findByEmail(input.email);
        if (existingUser) throw new Error("Este email ya esta registrado");

        const hashedPassword = await hash(input.password, 10);  
        
        const newUser = await this.authRepository.createUser({
            ...input,
            password_hash: hashedPassword,
            role_id: 2,
        });
        
        const { password_hash, ...userWithoutPassword } = newUser;
        return userWithoutPassword
    }
}
