import {User} from '@domain/entities/User';

export interface IAuthRepository {
    createUser(user: User): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
}