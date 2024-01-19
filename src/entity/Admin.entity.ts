import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity({ name: "admins" })
export class Admin {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar")
    firstName: string;

    @Column("varchar")
    lastName: string;

    @Column("varchar", { length: 255, unique: true })
    email: string;

    @Column("varchar", { length: 255, select: false })
    password: string;

    @Column({ type: "int" })
    phoneNumber: number;

    @Column({ type: "varchar", default: "admin" })
    role: string;

    @Column({ type: "jsonb", nullable: true })
    avatar: {
        public_id: string;
        url: string;
    };

    @UpdateDateColumn()
    updatedAt: number;

    @CreateDateColumn()
    createdAt: number;
}
