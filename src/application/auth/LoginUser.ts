import { IAuthRepository } from "@domain/auth/IAuthRepository";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";


export class LoginUser {
    constructor(private authRepository: IAuthRepository){}

    async execute(email: string, password: string){
        const isUserValid = await this.authRepository.findByEmail(email);
        if(!isUserValid) throw new Error('Credenciales inválidas.')

        const isPasswordValid = await compare(password, isUserValid.password_hash);
        if(!isPasswordValid) throw new Error('Credenciales inválidas.')

            const payload = {
                id: isUserValid.id,
                email: isUserValid.email,
                role_id: isUserValid.role_id
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET || '', { expiresIn: '1h' });

            return { token };
    }
}