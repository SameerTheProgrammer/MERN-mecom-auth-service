import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Roles } from "../types/entity.type";

@Entity({ name: "users" })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    password: string;

    @Column({ type: "enum", enum: Roles, default: Roles.CUSTOMER })
    role: Roles;

    @BeforeInsert()
    @BeforeUpdate()
    updateEmail() {
        if (this.email) {
            this.email = this.email.toLowerCase();
        }
    }
}
