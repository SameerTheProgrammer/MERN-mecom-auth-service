import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Avatar, Roles } from "../types/entity.type";

@Entity({ name: "sellers" })
export class Seller {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar", { length: 255 })
    sellerName: string;

    @Column("varchar", { length: 255, unique: false })
    email: string;

    @Column("varchar", { length: 255, select: false })
    password: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ type: "varchar", length: 255 })
    address: string;

    @Column({ type: "int" })
    phoneNumber: number;

    @Column({ type: "enum", enum: Roles, default: Roles.SELLER })
    role: Roles;

    @Column({ type: "jsonb" })
    avatar: Avatar;

    @Column({ type: "int" })
    zipCode: number;

    @Column({ type: "int", default: 0 })
    avaiableBalance: number;

    @UpdateDateColumn()
    updatedAt: number;

    @CreateDateColumn()
    createdAt: number;
}
