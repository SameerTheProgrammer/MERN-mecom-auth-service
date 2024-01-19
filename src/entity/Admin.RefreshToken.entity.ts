import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

import { Admin } from "./Admin.entity";

@Entity({ name: "adminRefreshTokens" })
export class AdminRefreshToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "timestamp" })
    expireAt: Date;

    @ManyToOne(() => Admin)
    admin: Admin;

    @UpdateDateColumn()
    updatedAt: number;

    @CreateDateColumn()
    createdAt: number;
}
