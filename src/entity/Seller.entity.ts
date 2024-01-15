import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity({ name: "sellers" })
export class Seller {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar", { length: 255 })
    name: string;

    @Column("varchar", { length: 255, unique: true })
    email: string;

    @Column("varchar", { length: 255, select: false })
    password: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ type: "varchar", length: 255 })
    address: string;

    @Column({ type: "int" })
    phoneNumber: number;

    @Column({ type: "varchar", default: "seller" })
    role: string;

    @Column({ type: "jsonb", nullable: true })
    avatar: {
        public_id: string;
        url: string;
    };

    @Column({ type: "int" })
    zipCode: number;

    @Column({ type: "int", default: 0 })
    avaiableBalance: number;

    @UpdateDateColumn()
    updatedAt: number;

    @CreateDateColumn()
    createdAt: number;
}
